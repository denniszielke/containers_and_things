using System;
using System.IO;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using SixLabors.ImageSharp;
using System.Net.Http;
using System.Net;

namespace Image2Rgb
{
    public static class Function1
    {
        [FunctionName("Img2GrayArray")]
        public static async Task<IActionResult> Run(
            [HttpTrigger(AuthorizationLevel.Function, "get", "post", Route = null)] HttpRequest req,
            ILogger log)
        {
            log.LogInformation("C# HTTP trigger function processed a request.");

            // get path to image
            string imagePath = req.Query["imagepath"];
            string requestBody = await new StreamReader(req.Body).ReadToEndAsync();
            dynamic data = JsonConvert.DeserializeObject(requestBody);
            imagePath = imagePath ?? data?.imagepath;
            log.LogInformation($"Working on {imagePath}");

            // get label 
            string imageLabel= req.Query["label"];
            imageLabel= imageLabel?? data?.imageLabel;
            log.LogInformation($"Classified as {imageLabel}");

            //var filename = "D:\\local\\" + Guid.NewGuid().ToString();
            var filename = Environment.GetEnvironmentVariable("TEMP")+ Guid.NewGuid().ToString();
            // download file
            using (var client = new WebClient())
            {
                client.DownloadFile(imagePath, filename);
            }

            var bmp = Image.Load(filename);


            int w = bmp.Width;
            int h = bmp.Height;

            log.LogInformation($"Got image of size {w} x {h}.");

            double[] grayscalearray = new double[w * h];

            int          [] grayscalearrayint = new int[w * h];

            for (int i = 0; i < w; i++)
            {
                for (int j = 0; j < h; j++)
                {
                    int k = (i * w) + j;

                    var px = bmp[i, j].Rgb;

                    // convert to grayscale by adding different weights to RGB colors
                    // devide by 255 to scale from 0-1
                    // 1- to invert colors
                    grayscalearray[k] = 0.00001;
                    // grayscalearray[i * j] = (float)(((0.299f * (float)px.R )+ (0.587f * (float)px.G )+ (0.114f * (float)px.B) )/ (float)255);

                    //grayscalearray[k] += (1 - (((0.299 * px.R) + (0.587 * px.G) + (0.114 * px.B)) / 255));

                    // round up
                    grayscalearrayint[k] = 255 - (int)Math.Ceiling((0.299 * px.R) + (0.587 * px.G) + (0.114 * px.B));
                    grayscalearray[k]+=(((double)grayscalearrayint[k])/256);
                    


                }
            }

            try
            {
                File.Delete(filename);
            }
            catch (Exception)
            {

                // couldn't delete file. Ignore for now
                log.LogInformation($"Couldn't delete file { filename} ");
            }

            return (ActionResult)new OkObjectResult(grayscalearray);


        }
    }
}

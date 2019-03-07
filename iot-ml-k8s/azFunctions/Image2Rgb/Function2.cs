using System;
using System.IO;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using System.Data.SqlClient;
using System.Collections.Generic;
using Microsoft.WindowsAzure.Storage.File;
using System.Text;

namespace Image2Rgb
{
    public static class Function2
    {
        
        [FunctionName("CreateCSVs")]
        public static async Task<IActionResult> Run(
            [HttpTrigger(AuthorizationLevel.Function, "post", Route = null)] HttpRequest req,
            ILogger log)
        {
            log.LogInformation("C# HTTP trigger function processed a request.");

            string requestBody = await new StreamReader(req.Body).ReadToEndAsync();
            dynamic data = JsonConvert.DeserializeObject(requestBody);
            string dbtablename = data?.tablename;
            string sastoken = data?.filepath;
            
                      

            StringBuilder contentlinesLabel = new StringBuilder();
            StringBuilder contentlinesPixel = new StringBuilder();
            int count = 0;
            var str = Environment.GetEnvironmentVariable("sqldb_connection");
            Console.WriteLine(sastoken);
            var uri = new Uri(sastoken);
            CloudFileDirectory cfd = new CloudFileDirectory(uri);
            
            

            using (SqlConnection conn = new SqlConnection(str))
            {

                string sql = $"select pixels, label from {dbtablename}";
                conn.Open();
                SqlCommand cmd = new SqlCommand(sql, conn);
                SqlDataReader dr = cmd.ExecuteReader();

                // open csv file


                while (dr.Read())
                {
                    contentlinesPixel.Append(Convert.ToString(dr["pixels"])).Append(Environment.NewLine);
                    contentlinesLabel.Append(Convert.ToString(dr["label"])).Append(Environment.NewLine);
                    count++;
                }




            }
            DateTime date = DateTime.Now;


            CloudFile labelfile = cfd.GetFileReference($@"{ dbtablename }_{ date.Ticks}_labelfile.csv");
            await labelfile.UploadTextAsync(contentlinesLabel.ToString() + Environment.NewLine);

            CloudFile pixelfile = cfd.GetFileReference($@"{ dbtablename }_{ date.Ticks}_pixelfile.csv");                               
            await pixelfile.UploadTextAsync(contentlinesPixel.ToString()+Environment.NewLine);


            return (ActionResult)new OkObjectResult($"Wrote {count} lines int {sastoken}" );

        }
    }
}

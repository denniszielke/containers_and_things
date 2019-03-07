$file = "mnist_test_images_merged_ps.xlsx" 
$sheetName = "mnist_test_images_merged" 

$objExcel = New-Object -ComObject Excel.Application
$workbook = $objExcel.Workbooks.Open($file) 
$sheet = $workbook.Worksheets.Item($sheetName)
$objExcel.Visible=$false 

$rowMax = ($sheet.UsedRange.Rows).count 


for ($i=1; $i -le $rowMax-1; $i++)
{ 
    
    $px= $sheet.Cells.Item(1+$i,2).text 
    $lb = $sheet.Cells.Item(1+$i,4).text 
    echo $px
    echo $lb

   $content = 
    @{ 
        label=$lb
        pixel=$px
        }
    $body = $content | ConvertTo-Json
    Invoke-RestMethod -Uri $azFunctionUploadUrl -Method POST -Body $body -ContentType 'application/json'
}

   

  

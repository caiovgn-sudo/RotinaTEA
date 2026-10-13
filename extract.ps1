Add-Type -AssemblyName System.IO.Compression.FileSystem

function Extract-Docx($docxFile, $outPath) {
    $zip = [System.IO.Compression.ZipFile]::OpenRead($docxFile.FullName)
    $entry = $zip.GetEntry('word/document.xml')
    $stream = $entry.Open()
    $reader = New-Object System.IO.StreamReader($stream)
    $raw = $reader.ReadToEnd()
    $reader.Close()
    $stream.Close()
    $zip.Dispose()

    $text = $raw -replace '</w:p>', "`r`n"
    $text = $text -replace '<[^>]+>', ''
    $text = [System.Net.WebUtility]::HtmlDecode($text)
    [System.IO.File]::WriteAllText($outPath, $text, [System.Text.Encoding]::UTF8)
    Write-Output "Extracted $($docxFile.Name) to $outPath"
}

function Extract-Pptx($pptxFile, $outPath) {
    $zip = [System.IO.Compression.ZipFile]::OpenRead($pptxFile.FullName)
    $allText = ""
    $slides = $zip.Entries | Where-Object { $_.FullName -like 'ppt/slides/slide*.xml' }
    foreach ($slide in $slides) {
        $stream = $slide.Open()
        $reader = New-Object System.IO.StreamReader($stream)
        $raw = $reader.ReadToEnd()
        $reader.Close()
        $stream.Close()
        $text = $raw -replace '</a:p>', "`r`n"
        $text = $text -replace '<[^>]+>', ''
        $text = [System.Net.WebUtility]::HtmlDecode($text)
        $allText += "`r`n=== SLIDE: " + $slide.Name + " ===`r`n" + $text + "`r`n"
    }
    $zip.Dispose()
    [System.IO.File]::WriteAllText($outPath, $allText, [System.Text.Encoding]::UTF8)
    Write-Output "Extracted $($pptxFile.Name) to $outPath"
}

$docx = Get-ChildItem -Path . -Filter "*.docx" | Select-Object -First 1
$pptx = Get-ChildItem -Path . -Filter "*.pptx" | Select-Object -First 1

if ($docx) { Extract-Docx $docx "extracted_preprojeto.txt" }
if ($pptx) { Extract-Pptx $pptx "extracted_slides.txt" }

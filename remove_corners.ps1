$files = Get-ChildItem -Path "d:\My-Freelanching-Work\Qobo1live\admin-panel\src\styles\*.css" -Recurse
foreach ($file in $files) {
    $content = Get-Content $file.FullName
    $newContent = $content -replace 'border-radius:\s*[^0;!][^;]*;', 'border-radius: 0px;'
    $newContent | Set-Content $file.FullName
}

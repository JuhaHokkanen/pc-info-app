try {
    
# Lue yksittäiset instanssit vain kerran
$osInfo     = Get-CimInstance Win32_OperatingSystem
$cpuInfo    = Get-CimInstance Win32_Processor
$gpuInfo    = Get-CimInstance Win32_VideoController | Select-Object -First 1
$biosInfo   = Get-CimInstance Win32_BIOS
$sysInfo    = Get-CimInstance Win32_ComputerSystem
$diskC      = Get-CimInstance Win32_LogicalDisk -Filter "DeviceID='C:'"
$bootTime   = $osInfo.LastBootUpTime
$diskInfo = Get-PhysicalDisk | Select-Object -First 1 -ExpandProperty BusType
$currentTime = Get-Date


# Laske käyttöaika
$uptime = New-TimeSpan -Start $bootTime -End $currentTime

# Muunna BIOS ReleaseDate (WMI aika) → DateTime
# $biosReleaseDate = $biosInfo.ReleaseDate

$bootTimeFormatted = $bootTime.ToString("dd.MM.yyyy HH:mm")

# Muotoile BIOS-version stringiksi, jos se on taulukko
$biosVersion = $biosInfo.BIOSVersion
if ($biosVersion -is [System.Array]) {
    $biosVersion = $biosVersion -join " / "
}

$pcInfo = @{
    
    System = @{
        ComputerName = $env:COMPUTERNAME
        OSName       = $osInfo.Caption
        OSVersion    = $osInfo.Version
        OSBuild      = $osInfo.BuildNumber
        LastBoot     = $bootTimeFormatted
        Uptime       = "{0}d {1}h {2}min" -f $uptime.Days, $uptime.Hours, $uptime.Minutes
        Timestamp    = $currentTime.ToString("yyyy-MM-dd HH:mm:ss")
    }
    Processor = @{
        Name    = $cpuInfo.Name
        Cores   = $cpuInfo.NumberOfCores
        Threads = $cpuInfo.ThreadCount
    }
    MotherBoard =@{
        Manufacturer = $sysInfo.Manufacturer
        Model        = $sysInfo.Model
    }

    Memory = @{
        TotalMemoryGB = [math]::Round($sysInfo.TotalPhysicalMemory / 1GB, 2)
    }
    Graphics = @{
        GPU = $gpuInfo.Name
    }
    BIOS = @{
        Manufacturer = $biosInfo.Manufacturer
        BIOSVersion = $biosVersion
    }
    Disk = @{
        Drive        = "C:"
        UsedSpaceGB  = [math]::Round(($diskC.Size - $diskC.FreeSpace) / 1GB, 2)
        FreeSpaceGB  = [math]::Round($diskC.FreeSpace / 1GB, 2)
        TotalSizeGB  = [math]::Round($diskC.Size / 1GB, 2)
        Type = $diskInfo
    }
    User = @{
        Username       = $env:USERNAME
        FolderSizeGB   = [math]::Round(
            (Get-ChildItem -Path $env:USERPROFILE -Recurse -File -ErrorAction SilentlyContinue | Measure-Object Length -Sum).Sum / 1GB, 2
        )
    }
}

}
catch {
    <#Do this if a terminating exception happens#>
    Write-Host ""
    Write-Host " VIRHE TIETOJEN KERUUSSA!" -ForegroundColor Red
    Write-Host " Virhe: $($_.Exception.Message)" -ForegroundColor Yellow
    Write-Host " Rivi: $($_.InvocationInfo.ScriptLineNumber)" -ForegroundColor Gray
    exit 1
}

# Määritä JSON-tiedoston tallennuspolku


# Tallennetaan JSON-muotoisena tiedostoon (huom! -Depth 5)
$pcInfo | ConvertTo-Json -Depth 5 | Set-Content -Encoding UTF8 -Path "./public/pcinfo.json"

Write-Host "pcinfo.json tallennettu: $jsonPath" -ForegroundColor Green

# Build ja deploy
Write-Host " Suoritetaan build ja julkaisu GitHub Pagesiin..."
npm run deploy

Write-Host " Sivusto päivitetty:"
Write-Host " https://juhahokkanen.github.io/pc-info-app/"
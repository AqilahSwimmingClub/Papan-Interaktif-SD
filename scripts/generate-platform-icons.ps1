param(
  [Parameter(Mandatory = $true)]
  [string] $SourceLogo
)

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

$projectRoot = Split-Path -Parent $PSScriptRoot
$sourcePath = (Resolve-Path -LiteralPath $SourceLogo).Path
$officialSource = Join-Path $projectRoot 'assets\app-logo.png'
$webIconDir = Join-Path $projectRoot 'public\icons'
$resourceDir = Join-Path $projectRoot 'resources'

New-Item -ItemType Directory -Force -Path $webIconDir, $resourceDir | Out-Null
Copy-Item -LiteralPath $sourcePath -Destination $officialSource -Force

function Save-ResizedPng {
  param(
    [System.Drawing.Image] $Image,
    [int] $Size,
    [string] $Destination,
    [double] $Scale = 1.0,
    [string] $Background = '#000000'
  )

  $bitmap = [System.Drawing.Bitmap]::new($Size, $Size, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  try {
    $graphics.Clear([System.Drawing.ColorTranslator]::FromHtml($Background))
    $graphics.CompositingMode = [System.Drawing.Drawing2D.CompositingMode]::SourceOver
    $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality

    $drawSize = [int][Math]::Round($Size * $Scale)
    $offset = [int][Math]::Floor(($Size - $drawSize) / 2)
    $graphics.DrawImage($Image, $offset, $offset, $drawSize, $drawSize)
    $bitmap.Save($Destination, [System.Drawing.Imaging.ImageFormat]::Png)
  }
  finally {
    $graphics.Dispose()
    $bitmap.Dispose()
  }
}

function Save-SolidPng {
  param(
    [int] $Size,
    [string] $Destination,
    [string] $Background
  )

  $bitmap = [System.Drawing.Bitmap]::new($Size, $Size, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  try {
    $graphics.Clear([System.Drawing.ColorTranslator]::FromHtml($Background))
    $bitmap.Save($Destination, [System.Drawing.Imaging.ImageFormat]::Png)
  }
  finally {
    $graphics.Dispose()
    $bitmap.Dispose()
  }
}

function Save-SplashPng {
  param(
    [System.Drawing.Image] $Image,
    [int] $Width,
    [int] $Height,
    [string] $Destination
  )

  $bitmap = [System.Drawing.Bitmap]::new($Width, $Height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  try {
    $graphics.Clear([System.Drawing.ColorTranslator]::FromHtml('#071A2E'))
    $graphics.CompositingMode = [System.Drawing.Drawing2D.CompositingMode]::SourceOver
    $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality

    $drawSize = [int][Math]::Round([Math]::Min($Width, $Height) * 0.58)
    $x = [int][Math]::Floor(($Width - $drawSize) / 2)
    $y = [int][Math]::Floor(($Height - $drawSize) / 2)
    $graphics.DrawImage($Image, $x, $y, $drawSize, $drawSize)
    $bitmap.Save($Destination, [System.Drawing.Imaging.ImageFormat]::Png)
  }
  finally {
    $graphics.Dispose()
    $bitmap.Dispose()
  }
}

$logo = [System.Drawing.Image]::FromFile($officialSource)
try {
  if ($logo.Width -ne $logo.Height) {
    throw 'Logo resmi harus persegi agar tidak terdistorsi.'
  }

  Save-ResizedPng $logo 32 (Join-Path $webIconDir 'favicon-32.png')
  Save-ResizedPng $logo 48 (Join-Path $webIconDir 'favicon-48.png')
  Save-ResizedPng $logo 96 (Join-Path $webIconDir 'shortcut-96.png')
  Save-ResizedPng $logo 180 (Join-Path $webIconDir 'apple-touch-icon.png')
  Save-ResizedPng $logo 192 (Join-Path $webIconDir 'app-icon-192.png')
  Save-ResizedPng $logo 512 (Join-Path $webIconDir 'app-icon-512.png')

  # Maskable/adaptive foreground diberi ruang aman 10% di setiap sisi. Logo
  # tidak diedit; hanya diskalakan utuh di atas warna luar logo yang sama.
  Save-ResizedPng $logo 512 (Join-Path $webIconDir 'app-icon-maskable-512.png') 0.8 '#000000'
  Save-ResizedPng $logo 1024 (Join-Path $resourceDir 'icon.png')
  Save-ResizedPng $logo 1024 (Join-Path $resourceDir 'icon-foreground.png') 0.8 '#000000'
  Save-SolidPng 1024 (Join-Path $resourceDir 'icon-background.png') '#000000'
  Save-ResizedPng $logo 2732 (Join-Path $resourceDir 'splash.png') 0.48 '#071A2E'
  Save-ResizedPng $logo 2732 (Join-Path $resourceDir 'splash-dark.png') 0.48 '#071A2E'

  $androidRes = Join-Path $projectRoot 'android\app\src\main\res'
  if (Test-Path -LiteralPath $androidRes) {
    $launcherSizes = @{
      'mipmap-mdpi' = 48
      'mipmap-hdpi' = 72
      'mipmap-xhdpi' = 96
      'mipmap-xxhdpi' = 144
      'mipmap-xxxhdpi' = 192
    }
    $foregroundSizes = @{
      'mipmap-mdpi' = 108
      'mipmap-hdpi' = 162
      'mipmap-xhdpi' = 216
      'mipmap-xxhdpi' = 324
      'mipmap-xxxhdpi' = 432
    }
    foreach ($density in $launcherSizes.Keys) {
      $destination = Join-Path $androidRes $density
      Save-ResizedPng $logo $launcherSizes[$density] (Join-Path $destination 'ic_launcher.png')
      Save-ResizedPng $logo $launcherSizes[$density] (Join-Path $destination 'ic_launcher_round.png')
      Save-ResizedPng $logo $foregroundSizes[$density] (Join-Path $destination 'ic_launcher_foreground.png') 0.8 '#000000'
    }

    $splashSizes = @{
      'drawable-port-mdpi' = @(320, 480)
      'drawable-port-hdpi' = @(480, 800)
      'drawable-port-xhdpi' = @(720, 1200)
      'drawable-port-xxhdpi' = @(960, 1600)
      'drawable-port-xxxhdpi' = @(1280, 1920)
      'drawable-land-mdpi' = @(480, 320)
      'drawable-land-hdpi' = @(800, 480)
      'drawable-land-xhdpi' = @(1200, 720)
      'drawable-land-xxhdpi' = @(1600, 960)
      'drawable-land-xxxhdpi' = @(1920, 1280)
    }
    foreach ($density in $splashSizes.Keys) {
      $destination = Join-Path $androidRes $density
      $size = $splashSizes[$density]
      Save-SplashPng $logo $size[0] $size[1] (Join-Path $destination 'splash.png')
    }
    Save-SplashPng $logo 1024 1024 (Join-Path $androidRes 'drawable\splash.png')
  }
}
finally {
  $logo.Dispose()
}

$hash = (Get-FileHash -Algorithm SHA256 -LiteralPath $officialSource).Hash.ToLowerInvariant()
Write-Output "Logo resmi: $officialSource"
Write-Output "SHA-256: $hash"
Write-Output 'Ikon web dan resource Android selesai dibuat tanpa perubahan desain.'

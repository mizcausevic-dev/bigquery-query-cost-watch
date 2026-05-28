$ErrorActionPreference = "Stop"

$root = Resolve-Path (Join-Path $PSScriptRoot "..")
$screenshots = Join-Path $root "screenshots"
New-Item -ItemType Directory -Force -Path $screenshots | Out-Null

Add-Type -AssemblyName System.Drawing

function New-ProofImage {
    param(
        [string]$Path,
        [string]$Title,
        [string]$Subtitle,
        [string[]]$Bullets
    )

    $bitmap = New-Object System.Drawing.Bitmap 1600, 1000
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $graphics.Clear([System.Drawing.Color]::FromArgb(7, 10, 15))

    $panelBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(11, 18, 32))
    $accentBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(55, 255, 139))
    $altAccentBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(25, 199, 255))
    $textBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(233, 243, 255))
    $mutedBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(171, 186, 201))
    $borderPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(42, 111, 88), 2)

    $graphics.FillRectangle($panelBrush, 48, 48, 1504, 904)
    $graphics.DrawRectangle($borderPen, 48, 48, 1504, 904)

    $eyebrowFont = New-Object System.Drawing.Font("Segoe UI", 16, [System.Drawing.FontStyle]::Bold)
    $titleFont = New-Object System.Drawing.Font("Georgia", 34, [System.Drawing.FontStyle]::Bold)
    $bodyFont = New-Object System.Drawing.Font("Segoe UI", 18)
    $bulletFont = New-Object System.Drawing.Font("Segoe UI", 20, [System.Drawing.FontStyle]::Bold)

    $graphics.DrawString("BigQuery Query Cost Watch", $eyebrowFont, $accentBrush, 92, 92)
    $graphics.DrawString($Title, $titleFont, $textBrush, 92, 142)
    $graphics.DrawString($Subtitle, $bodyFont, $mutedBrush, 92, 214)

    $y = 320
    foreach ($bullet in $Bullets) {
        $graphics.DrawString("•", $bulletFont, $altAccentBrush, 108, $y)
        $graphics.DrawString($bullet, $bodyFont, $textBrush, 138, $y + 2)
        $y += 82
    }

    $graphics.DrawString("Synthetic proof render for README packaging.", $bodyFont, $mutedBrush, 92, 880)
    $bitmap.Save($Path, [System.Drawing.Imaging.ImageFormat]::Png)
    $graphics.Dispose()
    $bitmap.Dispose()
}

New-ProofImage -Path (Join-Path $screenshots "01-overview-proof.png") `
    -Title "Overview proof" `
    -Subtitle "Bytes-scanned spikes, slot pressure, attribution drift, and telemetry gaps in one BigQuery FinOps operator surface." `
    -Bullets @(
        "Query-cost posture and slot pressure surface before monthly surprises turn into executive escalations.",
        "Attribution coverage and telemetry freshness stay visible instead of buried in raw usage exports.",
        "Optimization packets make finance, platform, and analytics ownership explicit."
    )

New-ProofImage -Path (Join-Path $screenshots "02-query-lane-proof.png") `
    -Title "Query lane" `
    -Subtitle "Every lane keeps owner, drift family, optimization focus, status, and next action visible." `
    -Bullets @(
        "Scan efficiency, slot governance, attribution hygiene, and telemetry lanes stay separated cleanly.",
        "Bytes-scanned spikes and partition misses remain easy to scan.",
        "Optimization paths are ready for operator review."
    )

New-ProofImage -Path (Join-Path $screenshots "03-cost-risks-proof.png") `
    -Title "Cost risks" `
    -Subtitle "Findings map severity, scope, owner, drift family, and the exact query-cost rule that fired." `
    -Bullets @(
        "High-severity scan spikes and telemetry gaps surface first.",
        "Owner mapping keeps FinOps and data-platform accountability explicit.",
        "The lane is grounded in BigQuery cost-governance evidence."
    )

New-ProofImage -Path (Join-Path $screenshots "04-optimization-posture-proof.png") `
    -Title "Optimization posture" `
    -Subtitle "Packets tie completeness, blocker, owner, and escalation timing together." `
    -Bullets @(
        "Reservation balancing, hotspot tuning, and label cleanup stay readable.",
        "Red/yellow review posture is easy to scan.",
        "The system is shaped for real BigQuery FinOps proof."
    )

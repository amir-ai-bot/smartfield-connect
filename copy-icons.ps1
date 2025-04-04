# Define source files
$launcherIcon = "jpg2png\ic_launcher.png"
$foregroundIcon = "jpg2png\ic_launcher_foreground.png"

# Define target directories
$mipmap_dirs = @(
    "android\app\src\main\res\mipmap-xxxhdpi",
    "android\app\src\main\res\mipmap-xxhdpi",
    "android\app\src\main\res\mipmap-xhdpi",
    "android\app\src\main\res\mipmap-hdpi",
    "android\app\src\main\res\mipmap-mdpi"
)

# Copy icons to each directory
foreach ($dir in $mipmap_dirs) {
    Copy-Item -Path $launcherIcon -Destination "$dir\ic_launcher.png" -Force
    Copy-Item -Path $foregroundIcon -Destination "$dir\ic_launcher_foreground.png" -Force
    Write-Host "Copied icons to $dir"
} 
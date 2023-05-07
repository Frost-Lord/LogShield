param (
    $target = "http://localhost:7000",
    $duration = 60
)

$connectionCounts = @(64, 128, 256, 512, 1024, 2048, 4096, 80000000)

echo "============================================="
echo "========== Stress Testing Mass GET =========="
echo "============================================="

foreach ($connectionCount in $connectionCounts) {
    echo ""
    echo "--- Concurrent Connections: $connectionCount ---"
    $k6Command = "k6 run -u $connectionCount -d ${duration}s --http-method GET -e TARGET=$target script.js"
    Invoke-Expression $k6Command
}

echo "============================================="
echo "=== Stress Testing Nonce Submission Flood ==="
echo "============================================="

$payload = '{"type":"Buffer","data":[0,0,1,127,8,25,226,45,246,166,45,51,5,64,236,27]}'

foreach ($connectionCount in $connectionCounts) {
    echo ""
    echo "--- Concurrent Connections: $connectionCount ---"
    $k6Command = "k6 run -u $connectionCount -d ${duration}s --http-method POST --http-payload '$payload' -e TARGET=$target/pow script.js"
    Invoke-Expression $k6Command
}

Read-Host -Prompt "Press Enter to exit..."
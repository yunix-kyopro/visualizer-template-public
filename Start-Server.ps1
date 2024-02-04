Push-Location .\wasm
wasm-pack build --target web --out-dir ../public/wasm
Pop-Location
yarn dev

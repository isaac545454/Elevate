package com.elevate.kmp

class WasmPlatform : Platform {
    override val name: String = "Kotlin/Wasm"
}

actual fun getPlatform(): Platform = WasmPlatform()

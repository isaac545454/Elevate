package com.elevate.kmp

class JsPlatform : Platform {
    override val name: String = "Kotlin/JS"
}

actual fun getPlatform(): Platform = JsPlatform()

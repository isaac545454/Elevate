package com.elevate.kmp

class Greeting {
    private val platform = getPlatform()

    fun greet(): String = "Elevate KMP on ${platform.name}"
}

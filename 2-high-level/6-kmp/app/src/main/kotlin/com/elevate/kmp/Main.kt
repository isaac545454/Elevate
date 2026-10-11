package com.elevate.kmp

fun main() {
    println(Greeting().greet())
    println("Native shell → ${MfeCatalog.SHELL_URL}")
    MfeCatalog.links.forEach { println(" - ${it.label} (${it.eventName})") }
}

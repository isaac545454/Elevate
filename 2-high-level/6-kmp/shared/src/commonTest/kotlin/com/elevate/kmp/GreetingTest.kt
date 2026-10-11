package com.elevate.kmp

import kotlin.test.Test
import kotlin.test.assertTrue

class GreetingTest {
    @Test
    fun greetMentionsElevate() {
        assertTrue(Greeting().greet().contains("Elevate KMP"))
    }
}

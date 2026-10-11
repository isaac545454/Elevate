package com.elevate.kmp

import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertNull
import kotlin.test.assertTrue

class MfeCatalogTest {
    @Test
    fun threeLinksMatchEventBus() {
        val slugs = MfeCatalog.links.map { it.slug }
        assertEquals(listOf("jsonplaceholder", "pokemon", "rick"), slugs)
        assertEquals("home-pokemon", MfeId.POKEMON.eventName)
    }

    @Test
    fun fromSlugRoundTrip() {
        assertEquals(MfeId.RICK, MfeId.fromSlug("rick"))
        assertNull(MfeId.fromSlug("nope"))
    }

    @Test
    fun emitNavCallIsJs() {
        val js = NativeBridgeJs.emitNavCall("pokemon")
        assertTrue(js.contains(NativeBridgeJs.EMIT_FN))
        assertTrue(js.contains("pokemon"))
    }

    @Test
    fun shellUrlAsksNativeMode() {
        assertTrue(MfeCatalog.SHELL_URL.contains("native=1"))
        assertTrue(MfeCatalog.SHELL_URL.startsWith("http://127.0.0.1:5100"))
        assertTrue(MfeCatalog.SHELL_URL_FALLBACK.startsWith("http://127.0.0.1:5000"))
        assertEquals(2, MfeCatalog.shellUrls.size)
    }
}

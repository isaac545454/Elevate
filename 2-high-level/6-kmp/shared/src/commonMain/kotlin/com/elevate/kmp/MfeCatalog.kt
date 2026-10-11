package com.elevate.kmp

enum class MfeId(
    val slug: String,
    val label: String,
    val eventName: String,
    val accentHex: String,
) {
    JSONPLACEHOLDER("jsonplaceholder", "JSONPlaceholder", "home-jsonplaceholder", "#42B883"),
    POKEMON("pokemon", "Pokémon", "home-pokemon", "#61DAFB"),
    RICK("rick", "Rick and Morty", "home-rick", "#DD0031"),
    ;

    companion object {
        fun fromSlug(slug: String): MfeId? = entries.find { it.slug == slug }
    }
}

data class MfeLink(
    val slug: String,
    val label: String,
    val eventName: String,
    val accentHex: String,
) {
    constructor(id: MfeId) : this(id.slug, id.label, id.eventName, id.accentHex)
}

object MfeCatalog {
    // 5000 no macOS costuma ser AirPlay (Control Center). Simulator cai nisso.
    const val SHELL_URL: String = "http://127.0.0.1:5100/?native=1"
    const val SHELL_URL_FALLBACK: String = "http://127.0.0.1:5000/?native=1"
    val defaultMfe: MfeId = MfeId.JSONPLACEHOLDER
    val links: List<MfeLink> get() = MfeId.entries.map(::MfeLink)
    val shellUrls: List<String> get() = listOf(SHELL_URL, SHELL_URL_FALLBACK)

    fun allLinks(): Array<MfeLink> = links.toTypedArray()
    fun allShellUrls(): Array<String> = shellUrls.toTypedArray()
}

object NativeBridgeJs {
    const val HANDLER_NAME: String = "mfeBus"
    const val EMIT_FN: String = "__NATIVE_EMIT_NAV__"

    fun emitNavCall(slug: String): String = """$EMIT_FN("$slug")"""
}

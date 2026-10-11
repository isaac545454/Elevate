plugins {
    alias(libs.plugins.kotlinJvm)
    application
}

dependencies {
    implementation(project(":shared"))
}

application {
    mainClass.set("com.elevate.kmp.MainKt")
}

kotlin {
    jvmToolchain(21)
}

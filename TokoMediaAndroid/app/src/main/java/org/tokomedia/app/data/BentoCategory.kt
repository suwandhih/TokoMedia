package org.tokomedia.app.data

import androidx.compose.ui.graphics.Color

data class BentoCategory(
    val id: String,
    val title: String,
    val subtitle: String,
    val badge: String,
    val countLabel: String,
    val bgGrad: List<Color>,
    val iconBg: Color,
    val accentColor: Color,
    val iconType: String,
    val target: Target
)

val BentoCategories = listOf(
    BentoCategory(
        id = "film-riwayat-isa-al-masih",
        title = "Film Isa Al-Masih",
        subtitle = "Kisah Kehidupan, Mukjizat & Pelayanan",
        badge = "FEATURE FILM",
        countLabel = "177 Bahasa Daerah",
        bgGrad = listOf(Color(0xFFE6F4EA), Color(0xFFD1E7DD)),
        iconBg = Color(0xFF059669),
        accentColor = Color(0xFF059669),
        iconType = "film",
        target = Target.Languages("film-riwayat-isa-al-masih")
    ),
    BentoCategory(
        id = "video",
        title = "Video Kitab Suci",
        subtitle = "Visualisasi Kitab Suci Bab demi Bab",
        badge = "VIDEO SERIES",
        countLabel = "95+ Bahasa",
        bgGrad = listOf(Color(0xFFFFECEF), Color(0xFFFFD6DC)),
        iconBg = Color(0xFFE11D48),
        accentColor = Color(0xFFE11D48),
        iconType = "video",
        target = Target.Languages("video")
    ),
    BentoCategory(
        id = "clip",
        title = "Clip Kitab Suci",
        subtitle = "Cuplikan Pendek Penuh Hikmat",
        badge = "SHORT CLIPS",
        countLabel = "120+ Bahasa",
        bgGrad = listOf(Color(0xFFE0F7FA), Color(0xFFB2EBF2)),
        iconBg = Color(0xFF0284C7),
        accentColor = Color(0xFF0284C7),
        iconType = "clip",
        target = Target.Languages("clip")
    ),
    BentoCategory(
        id = "app",
        title = "Aplikasi Kitab Suci",
        subtitle = "Unduh Aplikasi Android & Audio Offline",
        badge = "269 ANDROID APPS",
        countLabel = "Google Play",
        bgGrad = listOf(Color(0xFFFEF9C3), Color(0xFFFEF08A)),
        iconBg = Color(0xFFD97706),
        accentColor = Color(0xFFD97706),
        iconType = "app",
        target = Target.Languages("app")
    ),
    BentoCategory(
        id = "film-ikatan-ilahi",
        title = "Film Ikatan Ilahi",
        subtitle = "12 Episode Sejarah Perjanjian Agung",
        badge = "12 EPISODE SERIES",
        countLabel = "42+ Bahasa",
        bgGrad = listOf(Color(0xFFEEF2FF), Color(0xFFE0E7FF)),
        iconBg = Color(0xFF4F46E5),
        accentColor = Color(0xFF4F46E5),
        iconType = "series",
        target = Target.Languages("film-ikatan-ilahi")
    )
)

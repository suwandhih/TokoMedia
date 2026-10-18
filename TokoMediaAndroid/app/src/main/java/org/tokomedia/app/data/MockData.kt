package org.tokomedia.app.data

import androidx.compose.ui.graphics.Color

const val MESSENGER_URL = "https://m.me/tokomedia.org"
const val PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=com.tokomedia.indonesia"

sealed interface Target {
    data class Languages(val category: String) : Target
    data class Videos(val language: String) : Target
    data class Url(val url: String) : Target
}

data class Category(
    val id: String,
    val title: String,
    val action: String,
    val colors: List<Color>,
    val textColor: Color,
    val target: Target
)

data class Language(val slug: String, val name: String)

data class Region(val name: String, val languages: List<Language>)

data class Video(
    val title: String,
    val duration: String,
    val views: Int,
    val publishedIso: String,
    val dateLabel: String
)

private val White = Color.White
private val Dark = Color(0xFF222222)

val HomeCategories = listOf(
    Category(
        id = "aplikasi-toko-media",
        title = "Aplikasi Toko Media",
        action = "Download Sekarang",
        colors = listOf(Color(0xFF2FBF71), Color(0xFF3DD6B0)),
        textColor = White,
        target = Target.Url(PLAY_STORE_URL)
    ),
    Category(
        id = "film-riwayat-isa-al-masih",
        title = "Film Isa Al-Masih",
        action = "Daftar Bahasa",
        colors = listOf(Color(0xFF1E5AA8), Color(0xFFD62B2B)),
        textColor = White,
        target = Target.Languages("film-riwayat-isa-al-masih")
    ),
    Category(
        id = "video",
        title = "Video Kitab Suci",
        action = "Daftar Bahasa",
        colors = listOf(Color(0xFFE8263B), Color(0xFFF3703C)),
        textColor = White,
        target = Target.Languages("video")
    ),
    Category(
        id = "clip",
        title = "Clip Kitab Suci",
        action = "Daftar Bahasa",
        colors = listOf(Color(0xFF0E9AB2), Color(0xFF2CC9EA)),
        textColor = White,
        target = Target.Languages("clip")
    ),
    Category(
        id = "app",
        title = "Aplikasi Kitab Suci",
        action = "Daftar Bahasa",
        colors = listOf(Color(0xFFF5C518), Color(0xFFFFE600)),
        textColor = Dark,
        target = Target.Languages("app")
    ),
    Category(
        id = "film-ikatan-ilahi",
        title = "Film Ikatan Ilahi",
        action = "Daftar Bahasa",
        colors = listOf(Color(0xFF1E5AA8), Color(0xFFE31E24)),
        textColor = White,
        target = Target.Languages("film-ikatan-ilahi")
    )
)

private fun String.toSlug(): String =
    lowercase().replace(Regex("[^a-z0-9]+"), "-").trim('-')

private fun languages(vararg names: String): List<Language> =
    names.map { Language(slug = it.toSlug(), name = it) }

val REGIONS = listOf(
    Region(
        "Sumatera",
        languages(
            "Aceh", "Bangka", "Batak Alas-Kluet", "Batak Angkola", "Batak Dairi (Pakpak Dairi)",
            "Batak Karo", "Batak Mandailing", "Batak Simalungun", "Batak Toba", "Col", "Enggano",
            "Gayo", "Jambi (Melayu)", "Kaur", "Kerinci"
        )
    ),
    Region(
        "Jawa, Bali, Nusa Tenggara",
        languages(
            "Adonara", "Badui", "Bali (Madya)", "Bali [Nusa Penida]", "Betawi", "Bima (Mbojo)",
            "Ende", "Hawu (Sabu)", "Ile Ape", "Jawa", "Jawa [Banten]", "Jawa [Banyumasan]",
            "Jawa [Cirebon]", "Kambera", "Kedang", "Lamaholot"
        )
    ),
    Region(
        "Kalimantan",
        languages(
            "Agabag", "Bakumpai", "Balangin", "Banjar", "Benyadu'", "Bidayuh Bau (Jagoi)",
            "Bukit (Melayu)", "Bulusu", "Hakka Pontianak", "Iban", "Kendayan (Kanayatn)",
            "Kenyah Mainstream", "Kota Bangun Kutai (Melayu)", "Lawangan", "Lundayeh"
        )
    ),
    Region(
        "Sulawesi",
        languages(
            "Andio", "Aralle", "Bada", "Bajau", "Balantak", "Bambam", "Banggai", "Batui",
            "Behoa", "Bugis", "Bugis [Soppeng]", "Buol", "Cia-Cia", "Duri", "Enrekang",
            "Gorontalo", "Kaili Da'a", "Kaili Ledo"
        )
    ),
    Region(
        "Maluku, Papua",
        languages(
            "Ambai", "Ambon (Melayu)", "Ansus", "Biak", "Dani Barat (Lani)", "Fordata", "Galela",
            "Hatam", "Ketengban", "Lepki", "Lik", "Loloda", "Mai Brat", "Maluku Utara (Melayu)", "Meyah"
        )
    )
)

val HomeLanguages = languages("Tonsawang", "Lepki", "Madura", "Aceh", "Batak Toba", "Bugis", "Biak", "Gorontalo")

fun categoryTitle(categoryId: String): String =
    HomeCategories.firstOrNull { it.id == categoryId }?.title ?: "Daftar Bahasa"

fun languageName(slug: String): String =
    REGIONS.flatMap { it.languages }.firstOrNull { it.slug == slug }?.name ?: slug

fun sampleVideos(language: String): List<Video> = listOf(
    Video("Riwayat Isa Al-Masih - $language", "02:07:54", 992, "2021-04-10", "10 Apr 21"),
    Video("01 Pada Mulanya Saat Penciptaan - $language", "08:08", 1097, "2021-04-21", "21 Apr 21"),
    Video("02 Kelahiran Isa Al-Masih - $language", "03:44", 2206, "2021-04-24", "24 Apr 21"),
    Video("03 Masa Kecil Isa Al-Masih - $language", "02:16", 974, "2021-04-24", "24 Apr 21")
)

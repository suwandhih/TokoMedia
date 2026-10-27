package org.tokomedia.app.ui

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

// Batas atas skala font sistem. Di atas nilai ini tata letak Spatial Bento
// (dock, header, kartu bento) mulai tumpang tindih pada layar sempit.
const val MAX_FONT_SCALE = 1.3f

// Rasio lebar:tinggi gambar logo TokoMedia (ic_tm_brand.png = 1162 x 308).
// Dipakai untuk menghitung lebar logo dari tinggi yang dipatok.
const val BRAND_LOGO_ASPECT = 1162f / 308f

// TokoMedia Spatial Bento Palette (Sesuai index.html Mode HP 430px)
val TokoGreen = Color(0xFF059669)
val TokoGreenLight = Color(0xFF10B981)
val TokoGreenSoft = Color(0x1F059669)
val TokoAccent = Color(0xFF4F46E5)
val TokoBg = Color(0xFFECF1F7)
val TokoDarkBg = Color(0xFF0B1220)
val TokoSurface = Color(0xFFFFFFFF)
val TokoGlass = Color(0xF2FFFFFF)
val TokoText = Color(0xFF0F172A)
val TokoTextSecondary = Color(0xFF334155)
val TokoMuted = Color(0xFF64748B)
val TokoBorder = Color(0x140F172A)
val TokoHeader = Color(0xFFFFFFFF)
val TokoSidebar = Color(0xFF0F172A)
val TokoLinkBlue = Color(0xFF1E5AA8)

private val TokoLightColorScheme = lightColorScheme(
    primary = TokoGreen,
    onPrimary = Color.White,
    background = TokoBg,
    surface = TokoSurface,
    onSurface = TokoText,
    onBackground = TokoText
)

private val TokoDarkColorScheme = darkColorScheme(
    primary = TokoGreenLight,
    onPrimary = Color(0xFF003827),
    background = TokoDarkBg,
    surface = Color(0xFF1E293B),
    onSurface = Color(0xFFE2E8F0),
    onBackground = Color(0xFFE2E8F0)
)

@Composable
fun TokoMediaTheme(
    darkTheme: Boolean = false,
    content: @Composable () -> Unit
) {
    MaterialTheme(
        colorScheme = if (darkTheme) TokoDarkColorScheme else TokoLightColorScheme,
        content = content
    )
}

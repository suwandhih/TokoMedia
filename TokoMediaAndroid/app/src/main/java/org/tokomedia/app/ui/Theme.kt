package org.tokomedia.app.ui

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

// TokoMedia Spatial Bento Palette (Sesuai index.html Mode HP 430px)
val TokoGreen = Color(0xFF059669)
val TokoGreenLight = Color(0xFF10B981)
val TokoGreenSoft = Color(0x1F059669)
val TokoAccent = Color(0xFF4F46E5)
val TokoBg = Color(0xFFECF1F7)
val TokoSurface = Color(0xFFFFFFFF)
val TokoGlass = Color(0xF2FFFFFF)
val TokoText = Color(0xFF0F172A)
val TokoTextSecondary = Color(0xFF334155)
val TokoMuted = Color(0xFF64748B)
val TokoBorder = Color(0x140F172A)
val TokoHeader = Color(0xFFFFFFFF)
val TokoSidebar = Color(0xFF0F172A)
val TokoLinkBlue = Color(0xFF1E5AA8)

private val TokoColorScheme = lightColorScheme(
    primary = TokoGreen,
    onPrimary = Color.White,
    background = TokoBg,
    surface = TokoSurface,
    onSurface = TokoText,
    onBackground = TokoText
)

@Composable
fun TokoMediaTheme(content: @Composable () -> Unit) {
    MaterialTheme(colorScheme = TokoColorScheme, content = content)
}

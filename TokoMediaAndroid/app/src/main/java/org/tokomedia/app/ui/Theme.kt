package org.tokomedia.app.ui

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

val TokoGreen = Color(0xFF2E9E4F)
val TokoHeader = Color(0xFF1B1B1B)
val TokoSidebar = Color(0xFF343A40)
val TokoLinkBlue = Color(0xFF1F6FB2)
val TokoMuted = Color(0xFF8A8A8A)
val TokoPage = Color(0xFFF8F9FA)

private val TokoColorScheme = lightColorScheme(
    primary = TokoGreen,
    onPrimary = Color.White,
    background = TokoPage,
    surface = Color.White,
    onSurface = Color(0xFF222222),
    onBackground = Color(0xFF222222)
)

@Composable
fun TokoMediaTheme(content: @Composable () -> Unit) {
    MaterialTheme(colorScheme = TokoColorScheme, content = content)
}

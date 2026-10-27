package org.tokomedia.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.compose.runtime.remember
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.unit.Density
import org.tokomedia.app.ui.MAX_FONT_SCALE
import org.tokomedia.app.ui.TokoMediaTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            var isDarkTheme by remember { mutableStateOf(false) }
            // Batasi skala font sistem agar tata letak Spatial Bento tidak tumpang tindih
            // pada HP dengan pengaturan huruf sangat besar.
            val density = LocalDensity.current
            val safeDensity = remember(density) {
                Density(density.density, density.fontScale.coerceAtMost(MAX_FONT_SCALE))
            }
            CompositionLocalProvider(LocalDensity provides safeDensity) {
                TokoMediaTheme(darkTheme = isDarkTheme) {
                    TokoMediaApp(
                        isDarkTheme = isDarkTheme,
                        onThemeToggle = { isDarkTheme = !isDarkTheme }
                    )
                }
            }
        }
    }
}

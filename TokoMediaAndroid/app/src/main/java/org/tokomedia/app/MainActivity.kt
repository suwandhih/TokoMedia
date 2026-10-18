package org.tokomedia.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import org.tokomedia.app.ui.TokoMediaTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            TokoMediaTheme {
                TokoMediaApp()
            }
        }
    }
}

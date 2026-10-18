package org.tokomedia.app.ui

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.automirrored.filled.Chat
import androidx.compose.material.icons.filled.Menu
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.SpanStyle
import androidx.compose.ui.text.buildAnnotatedString
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.withStyle

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun TokoTopBar(
    canGoBack: Boolean,
    onMenuClick: () -> Unit,
    onBackClick: () -> Unit,
    onMessengerClick: () -> Unit
) {
    TopAppBar(
        title = {
            Text(
                buildAnnotatedString {
                    withStyle(SpanStyle(color = Color.White, fontWeight = FontWeight.Bold)) {
                        append("TOKO ")
                    }
                    withStyle(SpanStyle(color = TokoGreen, fontWeight = FontWeight.Bold)) {
                        append("MEDIA")
                    }
                }
            )
        },
        navigationIcon = {
            if (canGoBack) {
                IconButton(onClick = onBackClick) {
                    Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Kembali")
                }
            } else {
                IconButton(onClick = onMenuClick) {
                    Icon(Icons.Filled.Menu, contentDescription = "Menu")
                }
            }
        },
        actions = {
            IconButton(onClick = onMessengerClick) {
                Icon(Icons.AutoMirrored.Filled.Chat, contentDescription = "FB Messenger")
            }
        },
        colors = TopAppBarDefaults.topAppBarColors(
            containerColor = TokoHeader,
            titleContentColor = Color.White,
            navigationIconContentColor = Color.White,
            actionIconContentColor = Color.White
        )
    )
}

package org.tokomedia.app.ui

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.text.SpanStyle
import androidx.compose.ui.text.buildAnnotatedString
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.withStyle

@Composable
fun Breadcrumb(parent: String, current: String) {
    Text(
        text = buildAnnotatedString {
            append("$parent » ")
            withStyle(SpanStyle(color = TokoLinkBlue, fontWeight = FontWeight.Bold)) {
                append(current)
            }
        },
        style = MaterialTheme.typography.titleMedium
    )
}

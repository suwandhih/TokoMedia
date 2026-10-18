package org.tokomedia.app.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import org.tokomedia.app.data.Language
import org.tokomedia.app.data.REGIONS
import org.tokomedia.app.data.categoryTitle

@Composable
fun LanguageScreen(categoryId: String, onLanguageClick: (Language) -> Unit) {
    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(16.dp)
    ) {
        item {
            Breadcrumb(parent = categoryTitle(categoryId), current = "Daftar Bahasa")
            Spacer(Modifier.height(4.dp))
        }
        REGIONS.forEach { region ->
            item {
                Text(
                    text = region.name,
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    color = TokoGreen,
                    modifier = Modifier.padding(top = 12.dp, bottom = 6.dp)
                )
            }
            items(region.languages.chunked(2)) { pair ->
                Row(
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    modifier = Modifier.padding(vertical = 4.dp)
                ) {
                    pair.forEach { language ->
                        LanguageItem(language, Modifier.weight(1f)) { onLanguageClick(language) }
                    }
                    if (pair.size < 2) Spacer(Modifier.weight(1f))
                }
            }
        }
    }
}

@Composable
private fun LanguageItem(language: Language, modifier: Modifier, onClick: () -> Unit) {
    Text(
        text = language.name,
        color = TokoLinkBlue,
        style = MaterialTheme.typography.bodyLarge,
        modifier = modifier
            .clip(RoundedCornerShape(8.dp))
            .background(Color.White)
            .clickable(onClick = onClick)
            .padding(12.dp)
    )
}

package org.tokomedia.app.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.Button
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import org.tokomedia.app.data.api.VideoDto
import org.tokomedia.app.data.repository.TokoMediaRepository

@Composable
fun SearchScreen(onVideoClick: (Int) -> Unit) {
    val repository = remember { TokoMediaRepository() }
    var query by remember { mutableStateOf("") }
    var results by remember { mutableStateOf<List<VideoDto>>(emptyList()) }
    var isLoading by remember { mutableStateOf(false) }
    var message by remember { mutableStateOf("Ketik kata kunci untuk mencari tayangan.") }

    fun performSearch() {
        if (query.trim().length < 2) {
            results = emptyList()
            message = "Masukkan minimal 2 karakter."
            return
        }
        isLoading = true
        message = ""
    }

    LaunchedEffect(isLoading) {
        if (isLoading) {
            val result = repository.searchVideos(query.trim())
            results = result.getOrNull().orEmpty()
            message = when {
                result.isFailure -> "Pencarian gagal. Periksa koneksi lalu coba lagi."
                results.isEmpty() -> "Tayangan tidak ditemukan."
                else -> ""
            }
            isLoading = false
        }
    }

    Column(
        modifier = Modifier.fillMaxSize().background(TokoBg).padding(horizontal = 16.dp)
    ) {
        Text("Cari Tayangan", color = TokoText, fontSize = 22.sp, fontWeight = FontWeight.ExtraBold)
        OutlinedTextField(
            value = query,
            onValueChange = { query = it },
            label = { Text("Kata kunci") },
            singleLine = true,
            modifier = Modifier.fillMaxWidth().padding(top = 12.dp)
        )
        Button(onClick = { performSearch() }, modifier = Modifier.fillMaxWidth().padding(top = 10.dp)) {
            Text("Cari")
        }
        if (isLoading) {
            Box(Modifier.fillMaxWidth().padding(top = 30.dp), contentAlignment = Alignment.Center) {
                CircularProgressIndicator(color = TokoGreen)
            }
        } else if (message.isNotEmpty()) {
            Text(message, color = TokoMuted, modifier = Modifier.padding(top = 24.dp))
        } else {
            LazyColumn(
                contentPadding = PaddingValues(vertical = 16.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                items(results) { video ->
                    Text(
                        text = video.displayTitle,
                        color = TokoText,
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier.fillMaxWidth().clickable { onVideoClick(video.id) }.padding(12.dp)
                    )
                }
            }
        }
    }
}

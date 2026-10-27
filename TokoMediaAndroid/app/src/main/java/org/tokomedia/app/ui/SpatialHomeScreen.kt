package org.tokomedia.app.ui

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.IntrinsicSize
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.defaultMinSize
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowForward
import androidx.compose.material.icons.filled.ChevronRight
import androidx.compose.material.icons.filled.Movie
import androidx.compose.material.icons.filled.PhoneAndroid
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.VideoLibrary
import androidx.compose.material.icons.filled.Videocam
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilterChipDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.pulltorefresh.PullToRefreshBox
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.compose.LifecycleEventEffect
import kotlinx.coroutines.launch
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import org.tokomedia.app.data.AllLanguagesList
import org.tokomedia.app.data.BentoCategories
import org.tokomedia.app.data.BentoCategory
import org.tokomedia.app.data.HomeLanguages
import org.tokomedia.app.data.Language
import org.tokomedia.app.data.Target
import org.tokomedia.app.data.api.CmsHomeContentDto
import org.tokomedia.app.data.api.VideoDto
import org.tokomedia.app.data.repository.TokoMediaRepository

enum class LangViewMode {
    AZ, BUBBLES
}

enum class HomeVideoSort(val label: String, val apiValue: String) {
    TRENDING("Tren", "trending"),
    POPULAR("Populer", "popular"),
    UNSEEN("Unseen", "unseen"),
    NEW("New", "newest"),
    OLD("Old", "oldest")
}

@OptIn(ExperimentalLayoutApi::class, ExperimentalMaterial3Api::class)
@Composable
fun SpatialHomeScreen(
    onTargetClick: (Target) -> Unit,
    onWatchHeroClick: () -> Unit,
    onVideoClick: (Int) -> Unit
) {
    val repository = remember { TokoMediaRepository() }
    var latestVideos by remember { mutableStateOf<List<VideoDto>>(emptyList()) }
    var isLoadingLatest by remember { mutableStateOf(true) }
    var cmsContent by remember { mutableStateOf(CmsHomeContentDto()) }
    var cmsError by remember { mutableStateOf<String?>(null) }
    var isRefreshing by remember { mutableStateOf(false) }
    var initialCmsLoadDone by remember { mutableStateOf(false) }
    val scope = rememberCoroutineScope()

    suspend fun loadCmsContent() {
        repository.getCmsHomeContent()
            .onSuccess {
                cmsContent = it
                cmsError = null
            }
            .onFailure {
                cmsError = "Isi Pusat Media belum dapat dimuat. Tarik ke bawah untuk mencoba lagi."
            }
    }

    var langMode by remember { mutableStateOf(LangViewMode.AZ) }
    var selectedLetter by remember { mutableStateOf("A") }
    var activeSort by remember { mutableStateOf(HomeVideoSort.TRENDING) }

    val alphabetLetters = remember {
        AllLanguagesList.map { it.name.trim().take(1).uppercase() }
            .distinct()
            .sorted()
    }

    val filteredLanguages = remember(selectedLetter) {
        AllLanguagesList.filter {
            it.name.trim().startsWith(selectedLetter, ignoreCase = true)
        }
    }

    LaunchedEffect(Unit) {
        loadCmsContent()
        initialCmsLoadDone = true
    }

    // Ambil ulang isi CMS setiap aplikasi kembali aktif, agar perubahan dari CMS
    // langsung terlihat tanpa perlu menutup aplikasi.
    LifecycleEventEffect(Lifecycle.Event.ON_RESUME) {
        if (initialCmsLoadDone) scope.launch { loadCmsContent() }
    }

    LaunchedEffect(activeSort) {
        isLoadingLatest = true
        val result = repository.getLatestVideos()
        if (result.isSuccess) {
            val list = result.getOrNull().orEmpty()
            val sortedList = when (activeSort) {
                HomeVideoSort.TRENDING -> list
                HomeVideoSort.POPULAR -> list.sortedByDescending { it.watchcounter }
                HomeVideoSort.UNSEEN -> list.sortedBy { it.watchcounter }
                HomeVideoSort.NEW -> list.sortedByDescending { it.datescheduleIso ?: it.dateschedule.orEmpty() }
                HomeVideoSort.OLD -> list.sortedBy { it.datescheduleIso ?: it.dateschedule.orEmpty() }
            }
            // Sesuai index.html: homeFeaturedVideos = sortedLatest.slice(0, 4)
            latestVideos = sortedList.take(4)
        }
        isLoadingLatest = false
    }

    PullToRefreshBox(
        isRefreshing = isRefreshing,
        onRefresh = {
            scope.launch {
                isRefreshing = true
                loadCmsContent()
                isRefreshing = false
            }
        },
        modifier = Modifier.fillMaxSize()
    ) {
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .background(MaterialTheme.colorScheme.background),
            contentPadding = PaddingValues(start = 14.dp, end = 14.dp, top = 8.dp, bottom = 90.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // =====================================================================
            // HERO BENTO CARD
            // =====================================================================
            item {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .shadow(8.dp, RoundedCornerShape(26.dp), spotColor = Color(0x140F172A))
                        .clip(RoundedCornerShape(26.dp))
                        .background(
                            Brush.linearGradient(
                                listOf(
                                    Color(0xFFFFFFFF),
                                    Color(0xFFEDF8F2),
                                    Color(0xFFD7F0E3)
                                )
                            )
                        )
                        .padding(20.dp)
                ) {
                    Column {
                        Row(
                            modifier = Modifier
                                .clip(RoundedCornerShape(99.dp))
                                .background(Color(0xFFE2F4EB))
                                .padding(horizontal = 10.dp, vertical = 5.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Box(
                                modifier = Modifier
                                    .size(7.dp)
                                    .clip(CircleShape)
                                    .background(TokoGreen)
                            )
                            Spacer(Modifier.width(6.dp))
                            Text(
                                text = cmsContent.label,
                                color = TokoGreen,
                                fontSize = 10.sp,
                                fontWeight = FontWeight.ExtraBold,
                                letterSpacing = 1.sp,
                                maxLines = 1,
                                overflow = TextOverflow.Ellipsis
                            )
                        }

                        Spacer(Modifier.height(14.dp))

                        Text(
                            text = cmsContent.title,
                            color = TokoText,
                            fontSize = 26.sp,
                            fontWeight = FontWeight.ExtraBold,
                            lineHeight = 32.sp
                        )

                        Spacer(Modifier.height(10.dp))

                        Text(
                            text = cmsContent.description,
                            color = TokoTextSecondary,
                            fontSize = 13.sp,
                            lineHeight = 19.sp
                        )

                        cmsError?.let { message ->
                            Spacer(Modifier.height(8.dp))
                            Text(
                                text = message,
                                color = Color(0xFFB91C1C),
                                fontSize = 11.5.sp,
                                lineHeight = 16.sp
                            )
                        }

                        Spacer(Modifier.height(16.dp))

                        Button(
                            onClick = onWatchHeroClick,
                            colors = ButtonDefaults.buttonColors(containerColor = TokoGreen),
                            shape = RoundedCornerShape(12.dp),
                            modifier = Modifier
                                .fillMaxWidth()
                                .heightIn(min = 46.dp)
                        ) {
                            Icon(Icons.Filled.PlayArrow, contentDescription = null, tint = Color.White, modifier = Modifier.size(18.dp))
                            Spacer(Modifier.width(6.dp))
                            Text(
                                text = cmsContent.primaryButton,
                                color = Color.White,
                                fontSize = 13.5.sp,
                                fontWeight = FontWeight.Bold,
                                maxLines = 1,
                                overflow = TextOverflow.Ellipsis
                            )
                        }

                        Spacer(Modifier.height(8.dp))

                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clip(RoundedCornerShape(12.dp))
                                .background(Color.White)
                                .clickable { onTargetClick(Target.Languages("film-riwayat-isa-al-masih")) }
                                .padding(vertical = 11.dp, horizontal = 14.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.Center
                        ) {
                            Text(
                                text = "${cmsContent.secondaryButton} ",
                                color = TokoText,
                                fontSize = 13.sp,
                                fontWeight = FontWeight.Bold,
                                maxLines = 1,
                                overflow = TextOverflow.Ellipsis,
                                modifier = Modifier.weight(1f, fill = false)
                            )
                            Icon(
                                Icons.AutoMirrored.Filled.ArrowForward,
                                contentDescription = null,
                                tint = TokoText,
                                modifier = Modifier.size(15.dp)
                            )
                        }
                    }
                }
            }

            // =====================================================================
            // 01 • KATEGORI UTAMA: PILIH FORMAT MEDIA
            // =====================================================================
            item {
                Column(modifier = Modifier.fillMaxWidth().padding(top = 4.dp)) {
                    Text(
                        text = "01 • KATEGORI UTAMA",
                        color = TokoGreen,
                        fontSize = 10.5.sp,
                        fontWeight = FontWeight.ExtraBold,
                        letterSpacing = 1.2.sp
                    )
                    Spacer(Modifier.height(2.dp))
                    Text(
                        text = "Pilih Format Media",
                        color = TokoText,
                        fontSize = 22.sp,
                        fontWeight = FontWeight.ExtraBold
                    )
                    Spacer(Modifier.height(2.dp))
                    Text(
                        text = "Ketuk kartu untuk melihat daftar bahasa per wilayah",
                        color = TokoMuted,
                        fontSize = 12.5.sp
                    )
                }
            }

            item {
                val firstCat = BentoCategories[0]
                FullWidthBentoCard(category = firstCat) { onTargetClick(firstCat.target) }
            }

            item {
                val rest = BentoCategories.drop(1)
                Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    rest.chunked(2).forEach { pair ->
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(IntrinsicSize.Max),
                            horizontalArrangement = Arrangement.spacedBy(12.dp)
                        ) {
                            pair.forEach { cat ->
                                MiniBentoCard(
                                    category = cat,
                                    modifier = Modifier
                                        .weight(1f)
                                        .fillMaxHeight()
                                ) { onTargetClick(cat.target) }
                            }
                            if (pair.size < 2) Spacer(Modifier.weight(1f))
                        }
                    }
                }
            }

            // =====================================================================
            // 02 • EKSPLORASI BAHASA: KATEGORI BAHASA & FORMAT
            // =====================================================================
            item {
                Surface(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(26.dp),
                    color = Color.White,
                    shadowElevation = 6.dp,
                    border = BorderStroke(1.dp, Color(0x140F172A))
                ) {
                    Column(modifier = Modifier.padding(18.dp)) {
                        Text(
                            text = "02 • EKSPLORASI BAHASA",
                            color = TokoGreen,
                            fontSize = 10.5.sp,
                            fontWeight = FontWeight.ExtraBold,
                            letterSpacing = 1.2.sp
                        )
                        Spacer(Modifier.height(2.dp))
                        Text(
                            text = "Kategori Bahasa & Format",
                            color = TokoText,
                            fontSize = 20.sp,
                            fontWeight = FontWeight.ExtraBold
                        )

                        Spacer(Modifier.height(12.dp))

                        Row(
                            modifier = Modifier
                                .clip(RoundedCornerShape(999.dp))
                                .background(Color(0xFFF1F5F9))
                                .padding(3.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Box(
                                modifier = Modifier
                                    .clip(RoundedCornerShape(999.dp))
                                    .background(if (langMode == LangViewMode.AZ) TokoGreen else Color.Transparent)
                                    .clickable { langMode = LangViewMode.AZ }
                                    .padding(horizontal = 12.dp, vertical = 6.dp),
                                contentAlignment = Alignment.Center
                            ) {
                                Text(
                                    text = "Indeks A–Z",
                                    color = if (langMode == LangViewMode.AZ) Color.White else TokoMuted,
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.Bold,
                                    maxLines = 1,
                                    softWrap = false
                                )
                            }

                            Box(
                                modifier = Modifier
                                    .clip(RoundedCornerShape(999.dp))
                                    .background(if (langMode == LangViewMode.BUBBLES) TokoGreen else Color.Transparent)
                                    .clickable { langMode = LangViewMode.BUBBLES }
                                    .padding(horizontal = 12.dp, vertical = 6.dp),
                                contentAlignment = Alignment.Center
                            ) {
                                Text(
                                    text = "Galeri Ikon",
                                    color = if (langMode == LangViewMode.BUBBLES) Color.White else TokoMuted,
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.Bold,
                                    maxLines = 1,
                                    softWrap = false
                                )
                            }
                        }

                        Spacer(Modifier.height(16.dp))

                        if (langMode == LangViewMode.AZ) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                modifier = Modifier.fillMaxWidth()
                            ) {
                                Box(
                                    modifier = Modifier
                                        .size(54.dp)
                                        .clip(RoundedCornerShape(16.dp))
                                        .background(
                                            Brush.linearGradient(
                                                listOf(Color(0xFF059669), Color(0xFF4F46E5))
                                            )
                                        ),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Text(
                                        text = selectedLetter,
                                        color = Color.White,
                                        fontSize = 26.sp,
                                        fontWeight = FontWeight.ExtraBold
                                    )
                                }
                                Spacer(Modifier.width(12.dp))
                                Column(modifier = Modifier.weight(1f)) {
                                    Text(
                                        text = "BAHASA BERAWALAN HURUF $selectedLetter",
                                        color = TokoGreen,
                                        fontSize = 10.sp,
                                        fontWeight = FontWeight.ExtraBold,
                                        letterSpacing = 1.sp,
                                        maxLines = 1,
                                        overflow = TextOverflow.Ellipsis
                                    )
                                    Spacer(Modifier.height(2.dp))
                                    Text(
                                        text = "${filteredLanguages.size} Bahasa Tersedia",
                                        color = TokoText,
                                        fontSize = 18.sp,
                                        fontWeight = FontWeight.ExtraBold,
                                        maxLines = 1,
                                        overflow = TextOverflow.Ellipsis
                                    )
                                }
                            }

                            Spacer(Modifier.height(14.dp))

                            FlowRow(
                                horizontalArrangement = Arrangement.spacedBy(6.dp),
                                verticalArrangement = Arrangement.spacedBy(6.dp),
                                modifier = Modifier.fillMaxWidth()
                            ) {
                                alphabetLetters.forEach { letter ->
                                    val isSelected = letter == selectedLetter
                                    Box(
                                        modifier = Modifier
                                            .size(34.dp)
                                            .clip(RoundedCornerShape(10.dp))
                                            .background(if (isSelected) TokoGreen else Color(0xFFF8FAFC))
                                            .clickable { selectedLetter = letter },
                                        contentAlignment = Alignment.Center
                                    ) {
                                        Text(
                                            text = letter,
                                            color = if (isSelected) Color.White else TokoTextSecondary,
                                            fontSize = 12.5.sp,
                                            fontWeight = FontWeight.Bold
                                        )
                                    }
                                }
                            }

                            Spacer(Modifier.height(16.dp))

                            // Di layar sempit nama bahasa panjang tidak muat 2 kolom,
                            // jadi grid turun menjadi 1 kolom agar nama tetap utuh.
                            BoxWithConstraints(modifier = Modifier.fillMaxWidth()) {
                                val columns = if (maxWidth < 340.dp) 1 else 2
                                Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                                    filteredLanguages.chunked(columns).forEach { group ->
                                        Row(
                                            modifier = Modifier.fillMaxWidth(),
                                            horizontalArrangement = Arrangement.spacedBy(10.dp)
                                        ) {
                                            group.forEach { lang ->
                                                AzLanguageCard(
                                                    language = lang,
                                                    modifier = Modifier.weight(1f)
                                                ) {
                                                    onTargetClick(Target.Videos(lang.slug))
                                                }
                                            }
                                            repeat(columns - group.size) { Spacer(Modifier.weight(1f)) }
                                        }
                                    }
                                }
                            }
                        } else {
                            LazyRow(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                                items(HomeLanguages) { lang ->
                                    BentoLanguageBubble(language = lang) {
                                        onTargetClick(Target.Videos(lang.slug))
                                    }
                                }
                            }
                        }
                    }
                }
            }

            // =====================================================================
            // 03 • STREAMING TERKINI: TAYANGAN PILIHAN TERBARU (VERTIKAL 4 VIDEO)
            // =====================================================================
            item {
                Column(modifier = Modifier.fillMaxWidth().padding(top = 8.dp)) {
                    Text(
                        text = "03 • STREAMING TERKINI",
                        color = TokoGreen,
                        fontSize = 10.5.sp,
                        fontWeight = FontWeight.ExtraBold,
                        letterSpacing = 1.2.sp
                    )
                    Spacer(Modifier.height(2.dp))
                    Text(
                        text = "Tayangan Pilihan Terbaru",
                        color = TokoText,
                        fontSize = 20.sp,
                        fontWeight = FontWeight.ExtraBold
                    )

                    Spacer(Modifier.height(8.dp))

                    LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        items(HomeVideoSort.entries) { sortOpt ->
                            val isSelected = sortOpt == activeSort
                            FilterChip(
                                selected = isSelected,
                                onClick = { activeSort = sortOpt },
                                label = { Text(sortOpt.label, fontSize = 11.5.sp, fontWeight = FontWeight.Bold) },
                                colors = FilterChipDefaults.filterChipColors(
                                    selectedContainerColor = TokoGreen,
                                    selectedLabelColor = Color.White
                                ),
                                shape = RoundedCornerShape(999.dp)
                            )
                        }
                    }
                }
            }

            if (isLoadingLatest) {
                item {
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(140.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        CircularProgressIndicator(color = TokoGreen)
                    }
                }
            } else if (latestVideos.isNotEmpty()) {
                // 1. & 2. Tampil VERTIKAL sebanyak 4 VIDEO (Persis index.html .video-bento-grid)
                items(latestVideos) { video ->
                    VerticalVideoBentoCard(
                        video = video,
                        onClick = { onVideoClick(video.id) }
                    )
                }

                // 3. Tombol [Jelajahi Semua Koleksi per Wilayah →] persis index.html
                item {
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(top = 10.dp, bottom = 12.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Surface(
                            shape = RoundedCornerShape(999.dp),
                            color = Color.White,
                            shadowElevation = 3.dp,
                            border = BorderStroke(1.dp, Color(0x180F172A)),
                            modifier = Modifier.clickable {
                                onTargetClick(Target.Languages("film-riwayat-isa-al-masih"))
                            }
                        ) {
                            Row(
                                modifier = Modifier.padding(horizontal = 18.dp, vertical = 12.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text(
                                    text = "Jelajahi Semua Koleksi per Wilayah ",
                                    color = TokoText,
                                    fontSize = 13.5.sp,
                                    fontWeight = FontWeight.Bold,
                                    maxLines = 2,
                                    overflow = TextOverflow.Ellipsis,
                                    modifier = Modifier.weight(1f, fill = false)
                                )
                                Icon(
                                    imageVector = Icons.AutoMirrored.Filled.ArrowForward,
                                    contentDescription = null,
                                    tint = TokoText,
                                    modifier = Modifier.size(16.dp)
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}

/**
 * Kartu Video Vertikal persis .vcard di index.html:
 * Thumbnail 16:9 di atas, Durasi di pojok kanan bawah, Judul tebal di bawah,
 * dan baris meta: Tokomedia ✔ dan [views] • [tanggal]
 */
@Composable
private fun VerticalVideoBentoCard(
    video: VideoDto,
    onClick: () -> Unit
) {
    Surface(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick),
        shape = RoundedCornerShape(20.dp),
        color = Color.White,
        shadowElevation = 4.dp,
        border = BorderStroke(1.dp, Color(0x140F172A))
    ) {
        Column(modifier = Modifier.padding(12.dp)) {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .aspectRatio(16f / 9f)
                    .clip(RoundedCornerShape(14.dp))
                    .background(Color(0xFF1E293B))
            ) {
                if (!video.thumbnail.isNullOrEmpty()) {
                    AsyncImage(
                        model = video.thumbnail,
                        contentDescription = video.displayTitle,
                        contentScale = ContentScale.Crop,
                        modifier = Modifier.fillMaxSize()
                    )
                }
                if (!video.duration.isNullOrEmpty()) {
                    Text(
                        text = video.duration,
                        color = Color.White,
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier
                            .align(Alignment.BottomEnd)
                            .padding(8.dp)
                            .background(Color.Black.copy(alpha = 0.8f), RoundedCornerShape(6.dp))
                            .padding(horizontal = 7.dp, vertical = 3.dp)
                    )
                }
            }

            Spacer(Modifier.height(10.dp))

            Text(
                text = video.displayTitle,
                color = TokoText,
                fontSize = 15.sp,
                fontWeight = FontWeight.Bold,
                lineHeight = 20.sp,
                maxLines = 2,
                overflow = TextOverflow.Ellipsis
            )

            Spacer(Modifier.height(6.dp))

            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(top = 4.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier.weight(1f, fill = false)
                ) {
                    Text(
                        text = "Tokomedia",
                        color = TokoGreen,
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold,
                        maxLines = 1,
                        softWrap = false
                    )
                    Spacer(Modifier.width(3.dp))
                    Text(
                        text = "✔",
                        color = TokoGreen,
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold
                    )
                }

                Text(
                    text = "${video.watchcounter} views • ${video.dateschedule.orEmpty()}",
                    color = TokoMuted,
                    fontSize = 11.sp,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis,
                    modifier = Modifier.weight(1f, fill = false)
                )
            }
        }
    }
}

@Composable
private fun AzLanguageCard(
    language: Language,
    modifier: Modifier = Modifier,
    onClick: () -> Unit
) {
    Surface(
        modifier = modifier
            .heightIn(min = 58.dp)
            .clickable(onClick = onClick),
        shape = RoundedCornerShape(14.dp),
        color = Color(0xFFF8FAFC),
        border = BorderStroke(1.dp, Color(0x140F172A))
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 10.dp, vertical = 8.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(6.dp)
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.weight(1f)
            ) {
                Box(
                    modifier = Modifier
                        .size(34.dp)
                        .clip(RoundedCornerShape(10.dp))
                        .background(Color(0xFFEDE9FE)),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = language.name.take(1).uppercase(),
                        color = Color(0xFF6D28D9),
                        fontSize = 13.sp,
                        fontWeight = FontWeight.ExtraBold
                    )
                }
                Spacer(Modifier.width(8.dp))
                Text(
                    text = language.name,
                    color = TokoText,
                    fontSize = 12.5.sp,
                    fontWeight = FontWeight.Bold,
                    maxLines = 2,
                    overflow = TextOverflow.Ellipsis,
                    modifier = Modifier.weight(1f)
                )
            }
            Icon(
                imageVector = Icons.Filled.ChevronRight,
                contentDescription = null,
                tint = TokoGreen,
                modifier = Modifier.size(16.dp)
            )
        }
    }
}

@Composable
private fun FullWidthBentoCard(category: BentoCategory, onClick: () -> Unit) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .shadow(6.dp, RoundedCornerShape(20.dp), spotColor = Color(0x100F172A))
            .clip(RoundedCornerShape(20.dp))
            .background(Brush.linearGradient(category.bgGrad))
            .clickable(onClick = onClick)
            .padding(18.dp)
    ) {
        Column {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Box(
                    modifier = Modifier
                        .size(40.dp)
                        .clip(RoundedCornerShape(12.dp))
                        .background(category.iconBg),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(Icons.Filled.Movie, contentDescription = null, tint = Color.White, modifier = Modifier.size(22.dp))
                }
                Box(
                    modifier = Modifier
                        .weight(1f, fill = false)
                        .clip(RoundedCornerShape(99.dp))
                        .background(Color.White)
                        .padding(horizontal = 10.dp, vertical = 4.dp)
                ) {
                    Text(
                        text = category.badge,
                        color = TokoText,
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Bold,
                        letterSpacing = 0.8.sp,
                        maxLines = 1,
                        softWrap = false,
                        overflow = TextOverflow.Ellipsis
                    )
                }
            }

            Spacer(Modifier.height(14.dp))

            Text(
                text = category.title,
                color = TokoText,
                fontSize = 18.sp,
                fontWeight = FontWeight.ExtraBold
            )
            Spacer(Modifier.height(3.dp))
            Text(
                text = category.subtitle,
                color = TokoTextSecondary,
                fontSize = 12.5.sp
            )

            Spacer(Modifier.height(14.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = category.countLabel,
                    color = category.accentColor,
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold,
                    maxLines = 2,
                    overflow = TextOverflow.Ellipsis,
                    modifier = Modifier.weight(1f, fill = false)
                )
                Text(
                    text = "Daftar Bahasa ›",
                    color = TokoText,
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold,
                    maxLines = 1,
                    softWrap = false
                )
            }
        }
    }
}

@Composable
private fun MiniBentoCard(category: BentoCategory, modifier: Modifier, onClick: () -> Unit) {
    Box(
        modifier = modifier
            .defaultMinSize(minHeight = 180.dp)
            .shadow(6.dp, RoundedCornerShape(20.dp), spotColor = Color(0x100F172A))
            .clip(RoundedCornerShape(20.dp))
            .background(Brush.linearGradient(category.bgGrad))
            .clickable(onClick = onClick)
            .padding(13.dp)
    ) {
        Column(modifier = Modifier.fillMaxSize(), verticalArrangement = Arrangement.SpaceBetween) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(6.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Box(
                    modifier = Modifier
                        .size(30.dp)
                        .clip(RoundedCornerShape(9.dp))
                        .background(category.iconBg),
                    contentAlignment = Alignment.Center
                ) {
                    val icon = when (category.iconType) {
                        "video" -> Icons.Filled.Videocam
                        "clip" -> Icons.Filled.PlayArrow
                        "app" -> Icons.Filled.PhoneAndroid
                        else -> Icons.Filled.VideoLibrary
                    }
                    Icon(icon, contentDescription = null, tint = Color.White, modifier = Modifier.size(16.dp))
                }
                Box(
                    modifier = Modifier
                        .weight(1f, fill = false)
                        .clip(RoundedCornerShape(99.dp))
                        .background(Color.White)
                        .padding(horizontal = 5.dp, vertical = 3.dp)
                ) {
                    Text(
                        text = category.badge,
                        color = TokoText,
                        fontSize = 7.5.sp,
                        fontWeight = FontWeight.Bold,
                        maxLines = 1,
                        softWrap = false,
                        overflow = TextOverflow.Ellipsis
                    )
                }
            }

            Spacer(Modifier.height(10.dp))

            Column {
                Text(
                    text = category.title,
                    color = TokoText,
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Bold,
                    lineHeight = 17.sp,
                    maxLines = 2,
                    softWrap = true,
                    overflow = TextOverflow.Clip,
                    modifier = Modifier.fillMaxWidth()
                )
                Spacer(Modifier.height(3.dp))
                Text(
                    text = category.subtitle,
                    color = TokoTextSecondary,
                    fontSize = 9.5.sp,
                    lineHeight = 13.sp,
                    maxLines = 2,
                    softWrap = true
                )
            }

            Spacer(Modifier.height(10.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(4.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = category.countLabel,
                    color = category.accentColor,
                    fontSize = 10.5.sp,
                    fontWeight = FontWeight.Bold,
                    maxLines = 2,
                    overflow = TextOverflow.Ellipsis,
                    modifier = Modifier.weight(1f, fill = false)
                )
                Text(text = "›", color = TokoText, fontSize = 16.sp, fontWeight = FontWeight.Bold)
            }
        }
    }
}

@Composable
private fun BentoLanguageBubble(language: Language, onClick: () -> Unit) {
    Column(
        modifier = Modifier
            .width(84.dp)
            .clickable(onClick = onClick),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Box(
            modifier = Modifier
                .size(56.dp)
                .shadow(3.dp, CircleShape, spotColor = Color(0x150F172A))
                .clip(CircleShape)
                .background(Color.White),
            contentAlignment = Alignment.Center
        ) {
            Text(
                text = language.name.take(2).uppercase(),
                color = TokoGreen,
                fontSize = 15.sp,
                fontWeight = FontWeight.ExtraBold
            )
        }
        Spacer(Modifier.height(6.dp))
        Text(
            text = language.name,
            color = TokoText,
            fontSize = 11.sp,
            fontWeight = FontWeight.Medium,
            maxLines = 2,
            overflow = TextOverflow.Ellipsis
        )
    }
}

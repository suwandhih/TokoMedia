package org.tokomedia.app.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Menu
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.outlined.DarkMode
import androidx.compose.material.icons.outlined.LightMode
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@Composable
fun SpatialTopBar(
    canGoBack: Boolean,
    onMenuClick: () -> Unit,
    onBackClick: () -> Unit,
    onHomeClick: () -> Unit = {},
    breadcrumbs: List<BreadcrumbItem> = listOf(BreadcrumbItem("Beranda")),
    onSearchClick: () -> Unit = {},
    isDarkTheme: Boolean = false,
    onThemeToggle: () -> Unit = {}
) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .background(Color(0xF2FFFFFF))
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 14.dp, vertical = 10.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Tombol Menu
            IconButton(
                onClick = onMenuClick,
                modifier = Modifier
                    .size(42.dp)
                    .clip(RoundedCornerShape(12.dp))
                    .background(Color.White)
            ) {
                Icon(
                    imageVector = Icons.Filled.Menu,
                    contentDescription = "Menu",
                    tint = TokoText,
                    modifier = Modifier.size(20.dp)
                )
            }

            // Tombol Back (muncul jika canGoBack true, sama seperti screenshot)
            if (canGoBack) {
                Spacer(Modifier.width(8.dp))
                IconButton(
                    onClick = onBackClick,
                    modifier = Modifier
                        .size(42.dp)
                        .clip(RoundedCornerShape(12.dp))
                        .background(Color.White)
                ) {
                    Icon(
                        imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                        contentDescription = "Kembali",
                        tint = TokoText,
                        modifier = Modifier.size(20.dp)
                    )
                }
            }

            Spacer(Modifier.width(10.dp))

            // Logo TokoMedia Resmi + Tagline MEDIA NUSANTARA
            Column(
                modifier = Modifier
                    .weight(1f)
                    .clickable { onHomeClick() }
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    // Ikon Toko Miniatur Hijau
                    Box(
                        modifier = Modifier
                            .size(22.dp)
                            .clip(RoundedCornerShape(4.dp))
                            .background(TokoGreen),
                        contentAlignment = Alignment.Center
                    ) {
                        Text("⌂", color = Color.White, fontSize = 13.sp, fontWeight = FontWeight.Bold)
                    }
                    Spacer(Modifier.width(5.dp))
                    Text("T", color = TokoText, fontWeight = FontWeight.ExtraBold, fontSize = 16.sp)
                    Text("O", color = TokoText, fontWeight = FontWeight.ExtraBold, fontSize = 16.sp)
                    Text("K", color = TokoText, fontWeight = FontWeight.ExtraBold, fontSize = 16.sp)
                    Spacer(Modifier.width(2.dp))
                    // Tombol Play Hijau
                    Box(
                        modifier = Modifier
                            .size(15.dp)
                            .clip(CircleShape)
                            .background(TokoGreen),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(Icons.Filled.PlayArrow, contentDescription = null, tint = Color.White, modifier = Modifier.size(10.dp))
                    }
                    Spacer(Modifier.width(2.dp))
                    Text("M", color = TokoText, fontWeight = FontWeight.ExtraBold, fontSize = 16.sp)
                    Text("E", color = TokoText, fontWeight = FontWeight.ExtraBold, fontSize = 16.sp)
                    Text("D", color = TokoText, fontWeight = FontWeight.ExtraBold, fontSize = 16.sp)
                    Spacer(Modifier.width(2.dp))
                    // Pause Bar Hijau
                    Row {
                        Box(modifier = Modifier.width(3.dp).height(12.dp).background(TokoGreen, RoundedCornerShape(1.dp)))
                        Spacer(Modifier.width(2.dp))
                        Box(modifier = Modifier.width(3.dp).height(12.dp).background(TokoGreen, RoundedCornerShape(1.dp)))
                    }
                    Spacer(Modifier.width(2.dp))
                    Text("A", color = TokoText, fontWeight = FontWeight.ExtraBold, fontSize = 16.sp)
                }
                Text(
                    text = "MEDIA NUSANTARA",
                    color = TokoMuted,
                    fontSize = 7.5.sp,
                    fontWeight = FontWeight.Bold,
                    letterSpacing = 1.6.sp
                )
            }

            // Tombol Search
            IconButton(
                onClick = onSearchClick,
                modifier = Modifier
                    .size(42.dp)
                    .clip(RoundedCornerShape(12.dp))
                    .background(Color.White)
            ) {
                Icon(
                    imageVector = Icons.Filled.Search,
                    contentDescription = "Cari",
                    tint = TokoMuted,
                    modifier = Modifier.size(19.dp)
                )
            }

            Spacer(Modifier.width(6.dp))

            // Tombol Tema Light
            IconButton(
                onClick = onThemeToggle,
                modifier = Modifier
                    .size(42.dp)
                    .clip(RoundedCornerShape(12.dp))
                    .background(Color.White)
            ) {
                Icon(
                    imageVector = if (isDarkTheme) Icons.Outlined.LightMode else Icons.Outlined.DarkMode,
                    contentDescription = if (isDarkTheme) "Mode terang" else "Mode gelap",
                    tint = TokoMuted,
                    modifier = Modifier.size(18.dp)
                )
            }
        }

        // Ribbon Status Breadcrumbs Dinamis (Identik index.html & Screenshot)
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .horizontalScroll(rememberScrollState())
                .padding(horizontal = 14.dp, vertical = 4.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            breadcrumbs.forEachIndexed { index, crumb ->
                val isLast = index == breadcrumbs.size - 1

                if (index > 0) {
                    Text(
                        text = " › ",
                        color = TokoMuted.copy(alpha = 0.6f),
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier.padding(horizontal = 2.dp)
                    )
                }

                if (isLast) {
                    // Item aktif sekarang (dengan border box putih rapi)
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(8.dp))
                            .background(Color.White)
                            .padding(horizontal = 10.dp, vertical = 4.dp)
                    ) {
                        Text(
                            text = crumb.label,
                            color = TokoText,
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }
                } else {
                    // Item link sebelumnya (dapat diklik kembali)
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(6.dp))
                            .clickable(enabled = crumb.onClick != null) { crumb.onClick?.invoke() }
                            .padding(horizontal = 6.dp, vertical = 4.dp)
                    ) {
                        Text(
                            text = crumb.label,
                            color = TokoMuted,
                            fontSize = 12.sp,
                            fontWeight = FontWeight.SemiBold
                        )
                    }
                }
            }
        }
        Spacer(Modifier.height(4.dp))
    }
}

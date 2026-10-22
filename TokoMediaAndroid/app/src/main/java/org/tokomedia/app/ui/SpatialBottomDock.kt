package org.tokomedia.app.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Language
import androidx.compose.material.icons.filled.PhoneAndroid
import androidx.compose.material.icons.filled.PlayCircleOutline
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

enum class DockTab(val label: String, val icon: ImageVector) {
    HOME("Beranda", Icons.Filled.Home),
    LANGUAGES("Bahasa", Icons.Filled.Language),
    WATCH("Tonton", Icons.Filled.PlayCircleOutline),
    APPS("Aplikasi", Icons.Filled.PhoneAndroid)
}

@Composable
fun SpatialBottomDock(
    currentTab: DockTab,
    onTabSelected: (DockTab) -> Unit
) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 14.dp, vertical = 10.dp),
        contentAlignment = Alignment.Center
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .shadow(16.dp, RoundedCornerShape(99.dp), spotColor = Color(0x240F172A))
                .clip(RoundedCornerShape(99.dp))
                .background(Color(0xF5FFFFFF))
                .padding(6.dp),
            horizontalArrangement = Arrangement.SpaceEvenly,
            verticalAlignment = Alignment.CenterVertically
        ) {
            DockTab.entries.forEach { tab ->
                val isSelected = tab == currentTab
                Row(
                    modifier = Modifier
                        .clip(RoundedCornerShape(99.dp))
                        .background(if (isSelected) TokoGreen else Color.Transparent)
                        .clickable { onTabSelected(tab) }
                        .padding(horizontal = 14.dp, vertical = 8.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(
                        imageVector = tab.icon,
                        contentDescription = tab.label,
                        tint = if (isSelected) Color.White else TokoMuted,
                        modifier = Modifier.size(18.dp)
                    )
                    Text(
                        text = " ${tab.label}",
                        color = if (isSelected) Color.White else TokoText,
                        fontSize = 11.5.sp,
                        fontWeight = if (isSelected) FontWeight.Bold else FontWeight.SemiBold
                    )
                }
            }
        }
    }
}

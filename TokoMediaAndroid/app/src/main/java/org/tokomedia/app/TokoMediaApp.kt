package org.tokomedia.app

import android.content.Intent
import android.net.Uri
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.DrawerValue
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.ModalNavigationDrawer
import androidx.compose.material3.Scaffold
import androidx.compose.material3.rememberDrawerState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import kotlinx.coroutines.launch
import org.tokomedia.app.data.BentoCategories
import org.tokomedia.app.data.MESSENGER_URL
import org.tokomedia.app.data.Target
import org.tokomedia.app.data.categoryTitle
import org.tokomedia.app.data.languageName
import org.tokomedia.app.ui.AppListScreen
import org.tokomedia.app.ui.BreadcrumbItem
import org.tokomedia.app.ui.DockTab
import org.tokomedia.app.ui.LanguageScreen
import org.tokomedia.app.ui.SideMenu
import org.tokomedia.app.ui.SideMenuItems
import org.tokomedia.app.ui.SearchScreen
import org.tokomedia.app.ui.SpatialBottomDock
import org.tokomedia.app.ui.SpatialHomeScreen
import org.tokomedia.app.ui.SpatialTopBar
import org.tokomedia.app.ui.VideoDetailScreen
import org.tokomedia.app.ui.VideoListScreen

private object Routes {
    const val HOME = "home"
    const val APPS = "apps"
    const val LANGUAGES = "languages/{category}"
    const val VIDEOS = "videos/{category}/{language}"
    const val VIDEO_DETAIL = "video_detail/{videoId}"
    const val SEARCH = "search"

    fun languages(category: String) = if (category == "app") APPS else "languages/$category"
    fun videos(category: String, language: String) = "videos/$category/$language"
    fun videoDetail(videoId: Int) = "video_detail/$videoId"
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun TokoMediaApp() {
    val navController = rememberNavController()
    val drawerState = rememberDrawerState(DrawerValue.Closed)
    val scope = rememberCoroutineScope()
    val context = LocalContext.current
    val backStackEntry by navController.currentBackStackEntryAsState()
    val currentRoute = backStackEntry?.destination?.route.orEmpty()
    val canGoBack = currentRoute != Routes.HOME

    fun openUrl(url: String) {
        context.startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(url)))
    }

    fun handleTarget(target: Target) {
        when (target) {
            is Target.Languages -> {
                if (target.category == "app") {
                    navController.navigate(Routes.APPS)
                } else {
                    navController.navigate(Routes.languages(target.category))
                }
            }
            is Target.Videos -> navController.navigate(Routes.videos("film-riwayat-isa-al-masih", target.language))
            is Target.Url -> openUrl(target.url)
        }
    }

    val breadcrumbs: List<BreadcrumbItem> = when {
        currentRoute == Routes.HOME -> listOf(
            BreadcrumbItem("Beranda")
        )
        currentRoute == Routes.APPS -> listOf(
            BreadcrumbItem("Beranda") { navController.navigate(Routes.HOME) { popUpTo(Routes.HOME) { inclusive = true } } },
            BreadcrumbItem("Koleksi Aplikasi")
        )
        currentRoute.startsWith("languages/") -> {
            val catSlug = backStackEntry?.arguments?.getString("category").orEmpty()
            val catTitle = BentoCategories.firstOrNull { it.id == catSlug }?.title
                ?: categoryTitle(catSlug)
            listOf(
                BreadcrumbItem("Beranda") { navController.navigate(Routes.HOME) { popUpTo(Routes.HOME) { inclusive = true } } },
                BreadcrumbItem(catTitle) { navController.navigate(Routes.languages(catSlug)) },
                BreadcrumbItem("Daftar Bahasa")
            )
        }
        currentRoute.startsWith("videos/") -> {
            val catSlug = backStackEntry?.arguments?.getString("category").orEmpty()
            val langSlug = backStackEntry?.arguments?.getString("language").orEmpty()
            val langName = languageName(langSlug)
            listOf(
                BreadcrumbItem("Beranda") { navController.navigate(Routes.HOME) { popUpTo(Routes.HOME) { inclusive = true } } },
                BreadcrumbItem("Daftar Bahasa") { navController.popBackStack() },
                BreadcrumbItem(langName)
            )
        }
        currentRoute.startsWith("video_detail/") -> {
            listOf(
                BreadcrumbItem("Beranda") { navController.navigate(Routes.HOME) { popUpTo(Routes.HOME) { inclusive = true } } },
                BreadcrumbItem("Detail Video")
            )
        }
        else -> listOf(
            BreadcrumbItem("Beranda")
        )
    }

    ModalNavigationDrawer(
        drawerState = drawerState,
        drawerContent = {
            SideMenu(
                items = SideMenuItems,
                onItemClick = { item ->
                    scope.launch { drawerState.close() }
                    handleTarget(item.target)
                }
            )
        }
    ) {
        Scaffold(
            topBar = {
                SpatialTopBar(
                    canGoBack = canGoBack,
                    onMenuClick = { scope.launch { drawerState.open() } },
                    onBackClick = { navController.popBackStack() },
                    onHomeClick = {
                        navController.navigate(Routes.HOME) {
                            popUpTo(Routes.HOME) { inclusive = true }
                        }
                    },
                    breadcrumbs = breadcrumbs,
                    onSearchClick = { navController.navigate(Routes.SEARCH) }
                )
            },
            bottomBar = {
                // Penentuan tab aktif secara presisi (tidak akan salah sorot lagi)
                val currentTab = when {
                    currentRoute == Routes.HOME -> DockTab.HOME
                    currentRoute == Routes.APPS -> DockTab.APPS
                    currentRoute == Routes.SEARCH -> DockTab.HOME
                    currentRoute.startsWith("languages") || currentRoute.startsWith("videos") -> DockTab.LANGUAGES
                    currentRoute.startsWith("video_detail") -> DockTab.WATCH
                    else -> DockTab.HOME
                }
                SpatialBottomDock(
                    currentTab = currentTab,
                    onTabSelected = { tab ->
                        when (tab) {
                            DockTab.HOME -> navController.navigate(Routes.HOME) {
                                popUpTo(Routes.HOME) { inclusive = true }
                            }
                            DockTab.LANGUAGES -> navController.navigate(Routes.languages("film-riwayat-isa-al-masih"))
                            DockTab.WATCH -> navController.navigate(Routes.videos("film-riwayat-isa-al-masih", "indonesia"))
                            DockTab.APPS -> navController.navigate(Routes.APPS)
                        }
                    }
                )
            }
        ) { innerPadding ->
            NavHost(
                navController = navController,
                startDestination = Routes.HOME,
                modifier = Modifier.padding(innerPadding)
            ) {
                composable(Routes.HOME) {
                    SpatialHomeScreen(
                        onTargetClick = { handleTarget(it) },
                        onWatchHeroClick = {
                            navController.navigate(Routes.videos("film-riwayat-isa-al-masih", "indonesia"))
                        },
                        onVideoClick = { videoId -> navController.navigate(Routes.videoDetail(videoId)) }
                    )
                }
                composable(Routes.APPS) {
                    AppListScreen()
                }
                composable(Routes.SEARCH) {
                    SearchScreen(onVideoClick = { videoId -> navController.navigate(Routes.videoDetail(videoId)) })
                }
                composable(
                    route = Routes.LANGUAGES,
                    arguments = listOf(navArgument("category") { type = NavType.StringType })
                ) { entry ->
                    val category = entry.arguments?.getString("category").orEmpty()
                    if (category == "app") {
                        AppListScreen()
                    } else {
                        LanguageScreen(
                            categoryId = category,
                            onLanguageClick = { language ->
                                navController.navigate(Routes.videos(category, language.slug))
                            }
                        )
                    }
                }
                composable(
                    route = Routes.VIDEOS,
                    arguments = listOf(
                        navArgument("category") { type = NavType.StringType },
                        navArgument("language") { type = NavType.StringType }
                    )
                ) { entry ->
                    val category = entry.arguments?.getString("category").orEmpty()
                    val language = entry.arguments?.getString("language").orEmpty()
                    VideoListScreen(
                        categorySlug = category,
                        languageSlug = language,
                        onVideoClick = { videoId -> navController.navigate(Routes.videoDetail(videoId)) }
                    )
                }
                composable(
                    route = Routes.VIDEO_DETAIL,
                    arguments = listOf(navArgument("videoId") { type = NavType.IntType })
                ) { entry ->
                    val videoId = entry.arguments?.getInt("videoId") ?: 0
                    VideoDetailScreen(
                        videoId = videoId,
                        onBackClick = { navController.popBackStack() },
                        onVideoClick = { nextId ->
                            navController.navigate(Routes.videoDetail(nextId))
                        }
                    )
                }
            }
        }
    }
}

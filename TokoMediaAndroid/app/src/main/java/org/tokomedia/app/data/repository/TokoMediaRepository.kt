package org.tokomedia.app.data.repository

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.tokomedia.app.data.api.ApiClient
import org.tokomedia.app.data.api.CategoryDto
import org.tokomedia.app.data.api.VideoDetailDto
import org.tokomedia.app.data.api.VideoDto

class TokoMediaRepository {

    private val api = ApiClient.apiService
    private val token = ApiClient.API_TOKEN

    suspend fun getCategoryTree(): Result<List<CategoryDto>> = withContext(Dispatchers.IO) {
        try {
            val response = api.getCategoryTree(token)
            if (response.status == 200 && response.data != null) {
                Result.success(response.data)
            } else {
                Result.failure(Exception(response.message ?: "Gagal memuat kategori"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun getLatestVideos(): Result<List<VideoDto>> = withContext(Dispatchers.IO) {
        try {
            val response = api.getLatestVideos(token, page = 1, perPage = 20)
            if (response.status == 200 && response.data != null) {
                Result.success(response.data)
            } else {
                Result.failure(Exception(response.message ?: "Gagal memuat video terbaru"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun getVideosByCategory(categorySlug: String, languageSlug: String): Result<List<VideoDto>> = withContext(Dispatchers.IO) {
        try {
            val response = when (categorySlug) {
                "film-riwayat-isa-al-masih" -> api.getRiwayatVideosBySlug(token, languageSlug)
                "video", "film-kitab-suci-injil" -> api.getVkitabVideosBySlug(token, languageSlug)
                "film-ikatan-ilahi" -> api.getIkatanVideosBySlug(token, languageSlug)
                "clip" -> api.getClipVideos(token)
                else -> api.getRiwayatVideosBySlug(token, languageSlug)
            }
            if (response.status == 200 && response.data != null) {
                Result.success(response.data)
            } else {
                Result.failure(Exception(response.message ?: "Gagal memuat video"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun getVideoDetail(videoId: Int): Result<VideoDetailDto> = withContext(Dispatchers.IO) {
        try {
            val response = api.getVideoDetail(token, videoId)
            if (response.status == 200 && response.data != null) {
                Result.success(response.data)
            } else {
                Result.failure(Exception(response.message ?: "Gagal memuat detail video"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}

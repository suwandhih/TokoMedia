package org.tokomedia.app.data.api

import com.google.gson.annotations.SerializedName

data class ApiResponse<T>(
    @SerializedName("status") val status: Int,
    @SerializedName("message") val message: String?,
    @SerializedName("data") val data: T?,
    @SerializedName("pagination") val pagination: PaginationDto? = null
)

data class PaginationDto(
    @SerializedName("total") val total: Int = 0,
    @SerializedName("page") val page: Int = 1,
    @SerializedName("per_page") val perPage: Int = 20,
    @SerializedName("has_more") val hasMore: Boolean = false
)

data class CategoryDto(
    @SerializedName("seq") val seq: Int,
    @SerializedName("categoryname") val categoryname: String,
    @SerializedName("slug") val slug: String,
    @SerializedName("parentid") val parentid: Int,
    @SerializedName("children") val children: List<CategoryDto>? = null
)

data class VideoDto(
    @SerializedName("id") val id: Int,
    @SerializedName("name") val name: String?,
    @SerializedName("title") val title: String?,
    @SerializedName("thumbnail") val thumbnail: String?,
    @SerializedName("watchcounter") val watchcounter: Long = 0,
    @SerializedName("duration") val duration: String?,
    @SerializedName("dateschedule") val dateschedule: String?,
    @SerializedName("dateschedule_iso") val datescheduleIso: String? = null
) {
    val displayTitle: String get() = title ?: name.orEmpty()
}

data class VideoDetailDto(
    @SerializedName("id") val id: Int,
    @SerializedName("title") val title: String,
    @SerializedName("content") val content: String?,
    @SerializedName("source") val source: String,
    @SerializedName("duration") val duration: String?,
    @SerializedName("dateschedule") val dateschedule: String?,
    @SerializedName("watchcounter") val watchcounter: Long = 0,
    @SerializedName("favcounter") val favcounter: Long = 0,
    @SerializedName("tag") val tag: String?,
    @SerializedName("thumbnail") val thumbnail: String?,
    @SerializedName("recomended") val recomended: List<VideoDto>? = null
)

data class AppDto(
    @SerializedName("id") val id: Any?,
    @SerializedName("name") val name: String,
    @SerializedName("slug") val slug: String?,
    @SerializedName("url") val url: String?,
    @SerializedName("thumbnail") val thumbnail: String?,
    @SerializedName("clicked") val clicked: Int = 0,
    @SerializedName("description") val description: String? = null
)

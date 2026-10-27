package org.tokomedia.app.data.api

import com.google.gson.JsonDeserializationContext
import com.google.gson.JsonDeserializer
import com.google.gson.JsonElement
import com.google.gson.annotations.SerializedName
import java.lang.reflect.Type

data class CmsHomeContentDto(
    @SerializedName("label") val label: String = "PUSAT MEDIA NUSANTARA",
    @SerializedName("title") val title: String = "Film, Video &\nAplikasi Kitab Suci\nNusantara.",
    @SerializedName("description") val description: String = "Nikmati ribuan tayangan rohani bermakna, kisah para nabi, serta aplikasi Kitab Suci Android dalam bahasa ibu dari Sabang sampai Merauke.",
    @SerializedName("primaryButton") val primaryButton: String = "Tonton Tayangan Sorotan",
    @SerializedName("secondaryButton") val secondaryButton: String = "Jelajahi Wilayah"
)

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
    @SerializedName("id") val id: Int = 0,
    @SerializedName("title") val title: String = "",
    @SerializedName("content") val content: String? = null,
    @SerializedName("source") val source: String = "",
    @SerializedName("duration") val duration: String? = null,
    @SerializedName("dateschedule") val dateschedule: String? = null,
    @SerializedName("watchcounter") val watchcounter: Long = 0,
    @SerializedName("favcounter") val favcounter: Long = 0,
    @SerializedName("tag") val tag: String? = null,
    @SerializedName("thumbnail") val thumbnail: String? = null,
    @SerializedName("recomended") val recomended: List<VideoDto>? = null
)

class VideoDetailDeserializer : JsonDeserializer<VideoDetailDto?> {
    override fun deserialize(
        json: JsonElement?,
        typeOfT: Type?,
        context: JsonDeserializationContext?
    ): VideoDetailDto? {
        if (json == null || json.isJsonNull) return null
        if (json.isJsonArray) {
            return null
        }
        if (json.isJsonObject) {
            val obj = json.asJsonObject
            return VideoDetailDto(
                id = obj.get("id")?.asInt ?: 0,
                title = obj.get("title")?.asString ?: "",
                content = obj.get("content")?.takeIf { !it.isJsonNull }?.asString,
                source = obj.get("source")?.asString ?: "",
                duration = obj.get("duration")?.takeIf { !it.isJsonNull }?.asString,
                dateschedule = obj.get("dateschedule")?.takeIf { !it.isJsonNull }?.asString,
                watchcounter = obj.get("watchcounter")?.asLong ?: 0,
                favcounter = obj.get("favcounter")?.asLong ?: 0,
                tag = obj.get("tag")?.takeIf { !it.isJsonNull }?.asString,
                thumbnail = obj.get("thumbnail")?.takeIf { !it.isJsonNull }?.asString,
                recomended = obj.get("recomended")?.takeIf { it.isJsonArray }?.let {
                    val array: Array<VideoDto>? = context?.deserialize(it, Array<VideoDto>::class.java)
                    array?.toList()
                }
            )
        }
        return null
    }
}

data class LikeResultDto(
    @SerializedName("totallike") val totallike: Long? = 0
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

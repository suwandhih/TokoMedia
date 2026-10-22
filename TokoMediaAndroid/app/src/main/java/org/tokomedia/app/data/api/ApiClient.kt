package org.tokomedia.app.data.api

import com.google.gson.GsonBuilder
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.concurrent.TimeUnit

object ApiClient {
    // Memanggil API TokoMedia melalui bridge publik resmi (sama persis dengan index.html)
    // Server bridge secara otomatis menambahkan token di sisi server sehingga aman dan 100% konsisten.
    const val BRIDGE_BASE_URL = "https://suwandhih.my.id/"

    private val loggingInterceptor = HttpLoggingInterceptor().apply {
        level = HttpLoggingInterceptor.Level.BASIC
    }

    private val okHttpClient = OkHttpClient.Builder()
        .connectTimeout(30, TimeUnit.SECONDS)
        .readTimeout(30, TimeUnit.SECONDS)
        .writeTimeout(30, TimeUnit.SECONDS)
        .addInterceptor(loggingInterceptor)
        .build()

    private val gson = GsonBuilder()
        .registerTypeAdapter(VideoDetailDto::class.java, VideoDetailDeserializer())
        .create()

    val apiService: TokoMediaApiService by lazy {
        Retrofit.Builder()
            .baseUrl(BRIDGE_BASE_URL)
            .client(okHttpClient)
            .addConverterFactory(GsonConverterFactory.create(gson))
            .build()
            .create(TokoMediaApiService::class.java)
    }
}

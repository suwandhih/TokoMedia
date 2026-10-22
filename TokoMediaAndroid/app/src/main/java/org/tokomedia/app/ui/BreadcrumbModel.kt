package org.tokomedia.app.ui

data class BreadcrumbItem(
    val label: String,
    val onClick: (() -> Unit)? = null
)

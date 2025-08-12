# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# Add any project specific keep options here:
# Keep annotations used by Razorpay
-keep class proguard.annotation.Keep
-keep class proguard.annotation.KeepClassMembers

# Keep all Razorpay classes and members
-keep class com.razorpay.** { *; }
-dontwarn com.razorpay.**

# Keep necessary inner classes and interfaces
-keepclassmembers class * {
    @proguard.annotation.Keep *;
    @proguard.annotation.KeepClassMembers *;
}

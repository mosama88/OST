<?php

namespace App\Enums;

enum GenderEnum: string
{
    case Male = '1';
    case Female = '2';

    public function label(): string
    {
        return match ($this) {
            self::Male => 'ذكر',
            self::Female => 'أنثى',
        };
    }

    public function color(): string
    {
        return match ($this) {
            self::Male => 'primary',   // أزرق للذكر
            self::Female => 'danger',  // أحمر للأنثى
        };
    }

    public function icon(): string
    {
        return match ($this) {
            self::Male => 'male',      // أيقونة ذكر
            self::Female => 'female',  // أيقونة أنثى
        };
    }

    // دالة إضافية للحصول على لون خفيف
    public function lightColor(): string
    {
        return match ($this) {
            self::Male => 'light-primary',
            self::Female => 'light-danger',
        };
    }
}
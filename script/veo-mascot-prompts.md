# Промпты Google Veo для маскота SEO Jarvis

Все клипы: **16:9, 1080p, 8 с, 24 fps**, Veo 3.1 (Google Flow). Каждый промпт прогнать 3–4 раза, выбрать лучший дубль. Звук не нужен.
Картинки: `refs/4-mascot/mascot-wink.png`, `refs/4-mascot/mascot-magnifier.png` (вырезаны из чёрного фона; если в Veo лучше работает с исходным чёрным фоном — берите `.jpg` рядом).
Фон в клипах — чистый чёрный: я вырежу его и поставлю маскота на тёмную сцену ролика. Готовые файлы называйте `A_take1.mp4`, `B_take2.mp4` и т. д.

Промпты на английском — так Veo понимает точнее. Под каждым — что происходит по секундам по-русски.

## A. Знакомство: логотип раскрывается в маскота

- **Где в ролике:** Сцена 03 · 0:07–0:11 ролика. Берём 2,0–6,0 с клипа (4 с). Перед этим в ролике плоский логотип перетекает в закрытый «шар» из лепестков — клип начинается с него.
- **Режим и картинки:** Frames to Video: последний кадр = mascot-wink.png (клип должен закончиться ровно этой позой). Если режима нет — Ingredients to Video с mascot-wink.png как референсом.
- **Кадр:** Персонаж по центру, занимает ~55% высоты кадра.

| Секунды клипа | Что делает маскот |
|---|---|
| 00:00–00:01.5 | Лепестки плотно сложены в закрытый глянцевый шар-спираль, лица не видно. Шар медленно вращается по часовой, один раз мягко «вспыхивает» синим изнутри. |
| 00:01.5–00:03.5 | Лепестки раскрываются наружу, как бутон, с вращением против часовой. Открывается тёмное стеклянное «лицо». Лёгкий подскок от раскрытия. |
| 00:03.5–00:04.5 | Глаза включаются с мягким мерцанием — две вертикальные «таблетки». Взгляд влево, потом вправо, как будто осматривается. |
| 00:04.5–00:05.5 | Смотрит прямо в камеру, чуть наклоняет голову. |
| 00:05.5–00:06.5 | Подмигивает: правый глаз становится «<», корпус чуть сжимается и распрямляется. |
| 00:06.5–00:08 | Держит позу подмигивания точно как на картинке, мягко парит. |

```
The SEO Jarvis mascot is born from its own spiral logo: a closed ball of swirling shells opens like a flower and reveals the character, who switches on its eyes and winks at the camera.

TIMELINE (8 seconds):
[00:00–00:01.5] The shells are tightly wrapped into a closed glossy spiral ball, the face is completely hidden. The ball slowly rotates clockwise and pulses once with a soft blue inner glow.
[00:01.5–00:03.5] The shells unfurl outward like a blooming flower while rotating counter-clockwise, revealing the dark glass visor face. The body makes a small bounce from the release.
[00:03.5–00:04.5] The eyes switch on with a soft flicker as two vertical glowing pills. The character glances left, then right, as if looking around.
[00:04.5–00:05.5] It looks straight into the camera and tilts its head slightly.
[00:05.5–00:06.5] It winks: the right eye turns into a "<" shape, the body does a tiny squash and stretch.
[00:06.5–00:08] It holds the wink pose exactly as in the reference image and gently floats in place.

FRAMING: character centered, about 55% of the frame height.

STYLE: premium 3D character animation, Pixar-level polish. The character is made of glossy pearlescent white and electric-blue (#1A69F0) translucent petal-like shells swirling around a round dark-navy glass visor face. The eyes are soft glowing white shapes on the visor (normally two vertical rounded pills; the wink is a '<' shape). Subtle subsurface scattering in the shells, soft blue rim light, gentle bloom on the eyes only. BACKGROUND: pure flat black #000000 for the whole clip — no gradient, no floor, no shadow, no particles, no environment. CAMERA: locked-off static shot, eye level, no zoom, no pan, no cuts. The character never touches the frame edges and keeps a clear margin on all sides. CONSISTENCY: the design, proportions, colors and number of shells stay exactly as in the reference image in every frame. MOTION: smooth and weighty, ease-in/ease-out, small squash-and-stretch, no jitter. AUDIO: silent, no music, no voice.

AVOID: text, letters, numbers, logos, watermark, mouth, teeth, nose, human features, fingers (hands are simple rounded white mitten shapes), extra limbs, legs, face morphing, eye color change, purple or green tints, lens flare streaks, confetti, sparkles, background objects, camera shake, motion blur trails.
```

## B. Анализ: проверяет шаги через лупу

- **Где в ролике:** Сцена 06 · 0:24–0:33 ролика. Берём весь клип, растягиваем до ~9 с. В ролике отзеркалим по горизонтали, чтобы лупа смотрела влево, на список шагов. Каждая «остановка» лупы = момент, когда шаг получает галочку.
- **Режим и картинки:** Frames to Video: первый кадр = mascot-magnifier.png.
- **Кадр:** Персонаж по центру, лупа целиком в кадре на всём протяжении.

| Секунды клипа | Что делает маскот |
|---|---|
| 00:00–00:01 | Стартовая поза как на картинке: держит лупу, глаза любопытные. |
| 00:01–00:02 | Поднимает лупу вверх и вперёд, наклоняется к ней; глаз видно сквозь стекло увеличенным. |
| 00:02–00:05 | Ведёт лупу вниз пятью короткими остановками по ~0,6 с. На каждой остановке — маленький кивок, глаза чуть щурятся. |
| 00:05–00:06 | Опускает лупу, глаза довольно расширяются, по стеклу пробегает блик. |
| 00:06–00:08 | Уверенный кивок, парит на месте, лупа в руке. |

```
The mascot holds a blue magnifying glass and carefully inspects an invisible checklist in front of it, moving the lens from top to bottom with five short stops.

TIMELINE (8 seconds):
[00:00–00:01] Starts in the exact pose of the reference image, holding the magnifier, eyes curious.
[00:01–00:02] It raises the magnifier up and forward and leans in; its glowing eye is seen enlarged through the lens.
[00:02–00:05] It moves the magnifier downward in five short stops of about 0.6 seconds each. At every stop it gives a tiny nod and the eyes squint slightly, as if ticking off an item.
[00:05–00:06] It lowers the magnifier, the eyes widen with satisfaction and a soft light glint sweeps across the lens.
[00:06–00:08] A confident approving nod, then it floats gently in place holding the magnifier.

FRAMING: character centered, the magnifying glass stays fully inside the frame at all times.

STYLE: premium 3D character animation, Pixar-level polish. The character is made of glossy pearlescent white and electric-blue (#1A69F0) translucent petal-like shells swirling around a round dark-navy glass visor face. The eyes are soft glowing white shapes on the visor (normally two vertical rounded pills; the wink is a '<' shape). Subtle subsurface scattering in the shells, soft blue rim light, gentle bloom on the eyes only. BACKGROUND: pure flat black #000000 for the whole clip — no gradient, no floor, no shadow, no particles, no environment. CAMERA: locked-off static shot, eye level, no zoom, no pan, no cuts. The character never touches the frame edges and keeps a clear margin on all sides. CONSISTENCY: the design, proportions, colors and number of shells stay exactly as in the reference image in every frame. MOTION: smooth and weighty, ease-in/ease-out, small squash-and-stretch, no jitter. AUDIO: silent, no music, no voice.

AVOID: text, letters, numbers, logos, watermark, mouth, teeth, nose, human features, fingers (hands are simple rounded white mitten shapes), extra limbs, legs, face morphing, eye color change, purple or green tints, lens flare streaks, confetti, sparkles, background objects, camera shake, motion blur trails.
```

## C. Запуск: радуется в окне «Поздравляем!»

- **Где в ролике:** Сцена 07 · 0:33–0:37 ролика. Берём 0,4–4,4 с клипа. Маскот выпрыгивает над окном кабинета вместо старого робота; приземление — точно на удар музыки.
- **Режим и картинки:** Frames to Video: первый кадр = mascot-wink.png.
- **Кадр:** Персонаж по центру, в верхней части ему нужно место для прыжка — держите его в центральных 60% кадра.

| Секунды клипа | Что делает маскот |
|---|---|
| 00:00–00:00.6 | Приседает: корпус сжимается, лепестки прижимаются — подготовка к прыжку. |
| 00:00.6–00:01.4 | Энергично подпрыгивает вверх, вытягивается, лепестки раскрываются веером. |
| 00:01.4–00:02.2 | В верхней точке делает полный оборот вокруг своей оси. |
| 00:02.2–00:03 | Приземляется со сжатием, лепестки возвращаются на место с лёгким покачиванием. |
| 00:03–00:04 | Глаза становятся счастливыми дужками «^ ^», маленький подскок. |
| 00:04–00:06 | Ещё один подскок поменьше, покачивается из стороны в сторону. |
| 00:06–00:08 | Успокаивается, смотрит в камеру, глаза-дужки, мягко парит. |

```
The mascot celebrates the successful launch with a joyful jump and a spin.

TIMELINE (8 seconds):
[00:00–00:00.6] Anticipation: the body squashes down and the shells tuck in tightly.
[00:00.6–00:01.4] It jumps up energetically, stretches, and the shells fan out wide.
[00:01.4–00:02.2] At the top of the jump it does one full 360-degree spin around its vertical axis.
[00:02.2–00:03] It lands with a squash, and the shells settle back into place with a gentle wobble.
[00:03–00:04] The eyes turn into happy upside-down U arcs, followed by a small hop.
[00:04–00:06] A second smaller hop, then it sways happily from side to side.
[00:06–00:08] It settles, faces the camera with happy arc eyes and floats gently.

FRAMING: character centered within the middle 60% of the frame, leaving headroom for the jump.

STYLE: premium 3D character animation, Pixar-level polish. The character is made of glossy pearlescent white and electric-blue (#1A69F0) translucent petal-like shells swirling around a round dark-navy glass visor face. The eyes are soft glowing white shapes on the visor (normally two vertical rounded pills; the wink is a '<' shape). Subtle subsurface scattering in the shells, soft blue rim light, gentle bloom on the eyes only. BACKGROUND: pure flat black #000000 for the whole clip — no gradient, no floor, no shadow, no particles, no environment. CAMERA: locked-off static shot, eye level, no zoom, no pan, no cuts. The character never touches the frame edges and keeps a clear margin on all sides. CONSISTENCY: the design, proportions, colors and number of shells stay exactly as in the reference image in every frame. MOTION: smooth and weighty, ease-in/ease-out, small squash-and-stretch, no jitter. AUDIO: silent, no music, no voice.

AVOID: text, letters, numbers, logos, watermark, mouth, teeth, nose, human features, fingers (hands are simple rounded white mitten shapes), extra limbs, legs, face morphing, eye color change, purple or green tints, lens flare streaks, confetti, sparkles, background objects, camera shake, motion blur trails.
```

## D. Регистрация: нажимает «Яндекс ID»

- **Где в ролике:** Сцена 04 · 0:11–0:18 ролика. Берём 0,5–4,5 с клипа. Маскот слева снизу от окна входа; нажатие (2,9 с клипа) совпадает с кликом по кнопке «Яндекс ID», сразу всплывает «Аккаунт создан».
- **Режим и картинки:** Ingredients to Video: референсы mascot-wink.png (внешний вид) и mascot-magnifier.png (как выглядят ручки). Лупы в этом клипе нет.
- **Кадр:** Персонаж в левой трети кадра, смотрит и тянется вправо.

| Секунды клипа | Что делает маскот |
|---|---|
| 00:00–00:01 | Вплывает из-за левого края в левую треть кадра, слегка наклонён вперёд, взгляд вправо. |
| 00:01–00:02 | Останавливается, смотрит на невидимую кнопку справа на уровне корпуса, глаза сосредоточенно сужаются. |
| 00:02–00:02.8 | Из-под лепестков выдвигается маленькая круглая белая ручка (как на второй картинке) и тянется вправо. |
| 00:02.8–00:03.2 | Короткое уверенное нажатие вперёд, корпус чуть сжимается, в точке нажатия — мягкая синяя вспышка. |
| 00:03.2–00:04 | Убирает ручку, отпружинивает назад. |
| 00:04–00:05 | Поворачивается к камере и подмигивает («<»). |
| 00:05–00:08 | Парит на месте, глаза обычные. |

```
The mascot glides in and presses an invisible button on its right with one small hand.

TIMELINE (8 seconds):
[00:00–00:01] It glides in from the left edge into the left third of the frame, leaning slightly forward, eyes looking to the right.
[00:01–00:02] It stops and looks at an invisible button to its right at body height; the eyes narrow in focus.
[00:02–00:02.8] A small rounded white mitten-like hand, the same as in the magnifier reference, extends from under the shells toward the right.
[00:02.8–00:03.2] One short confident press forward; the body squashes slightly and a soft blue light pulse appears at the touch point.
[00:03.2–00:04] It pulls the hand back and bounces back a little.
[00:04–00:05] It turns to the camera and winks with the "<" eye.
[00:05–00:08] It floats in place with normal eyes.

FRAMING: character in the left third of the frame, facing and reaching to the right.

STYLE: premium 3D character animation, Pixar-level polish. The character is made of glossy pearlescent white and electric-blue (#1A69F0) translucent petal-like shells swirling around a round dark-navy glass visor face. The eyes are soft glowing white shapes on the visor (normally two vertical rounded pills; the wink is a '<' shape). Subtle subsurface scattering in the shells, soft blue rim light, gentle bloom on the eyes only. BACKGROUND: pure flat black #000000 for the whole clip — no gradient, no floor, no shadow, no particles, no environment. CAMERA: locked-off static shot, eye level, no zoom, no pan, no cuts. The character never touches the frame edges and keeps a clear margin on all sides. CONSISTENCY: the design, proportions, colors and number of shells stay exactly as in the reference image in every frame. MOTION: smooth and weighty, ease-in/ease-out, small squash-and-stretch, no jitter. AUDIO: silent, no music, no voice.

AVOID: text, letters, numbers, logos, watermark, mouth, teeth, nose, human features, fingers (hands are simple rounded white mitten shapes), extra limbs, legs, face morphing, eye color change, purple or green tints, lens flare streaks, confetti, sparkles, background objects, camera shake, motion blur trails.
```

## E1. Меню: парит в центре (бесшовная петля)

- **Где в ролике:** Сцены 08–18 · 0:37–1:41 ролика. Петля 8 с крутится всё время тура по модулям, между нажатиями (клип E2).
- **Режим и картинки:** Frames to Video: первый и последний кадр = mascot-wink.png (тогда петля бесшовная).
- **Кадр:** Персонаж строго по центру, ~45% высоты кадра.

| Секунды клипа | Что делает маскот |
|---|---|
| 00:00–00:02 | Медленно поднимается вверх на небольшую высоту, глаза открываются из подмигивания в обычные. |
| 00:02–00:04 | Медленно опускается, лепестки чуть «дышат». |
| 00:04–00:04.3 | Моргает. |
| 00:04.3–00:06 | Смотрит влево, потом вправо (только глаза и лёгкий поворот). |
| 00:06–00:08 | Возвращается в центр и подмигивает — ровно как на первом кадре. |

```
Seamless idle loop: the mascot hovers calmly in the center, alive but not distracting.

TIMELINE (8 seconds):
[00:00–00:02] It slowly floats up a little; the eyes open from the wink into normal pills.
[00:02–00:04] It slowly floats down while the shells subtly breathe.
[00:04–00:04.3] It blinks once.
[00:04.3–00:06] It glances left, then right, with only the eyes and a slight body turn.
[00:06–00:08] It returns to center and winks, ending exactly on the first frame pose.

FRAMING: character exactly centered, about 45% of the frame height.

STYLE: premium 3D character animation, Pixar-level polish. The character is made of glossy pearlescent white and electric-blue (#1A69F0) translucent petal-like shells swirling around a round dark-navy glass visor face. The eyes are soft glowing white shapes on the visor (normally two vertical rounded pills; the wink is a '<' shape). Subtle subsurface scattering in the shells, soft blue rim light, gentle bloom on the eyes only. BACKGROUND: pure flat black #000000 for the whole clip — no gradient, no floor, no shadow, no particles, no environment. CAMERA: locked-off static shot, eye level, no zoom, no pan, no cuts. The character never touches the frame edges and keeps a clear margin on all sides. CONSISTENCY: the design, proportions, colors and number of shells stay exactly as in the reference image in every frame. MOTION: smooth and weighty, ease-in/ease-out, small squash-and-stretch, no jitter. AUDIO: silent, no music, no voice.

AVOID: text, letters, numbers, logos, watermark, mouth, teeth, nose, human features, fingers (hands are simple rounded white mitten shapes), extra limbs, legs, face morphing, eye color change, purple or green tints, lens flare streaks, confetti, sparkles, background objects, camera shake, motion blur trails.
```

## E2. Меню: поворачивается и нажимает пункт

- **Где в ролике:** Сцены 08–18 · 10 раз. Берём 0,5–4,5 с клипа. Для пунктов слева используем как есть, для пунктов справа — отзеркаливаем. Нажатие (2,0 с клипа) совпадает с моментом, когда пункт разворачивается в окно.
- **Режим и картинки:** Ingredients to Video: референсы mascot-wink.png и mascot-magnifier.png (ручки). Лупы нет.
- **Кадр:** Персонаж по центру, ручка тянется влево, но не выходит за 25% от левого края.

| Секунды клипа | Что делает маскот |
|---|---|
| 00:00–00:00.8 | Парит по центру, смотрит в камеру. |
| 00:00.8–00:01.6 | Поворачивает корпус примерно на 30° влево (для зрителя), взгляд влево. |
| 00:01.6–00:02.2 | Выдвигает маленькую ручку влево и один раз коротко нажимает; лёгкое сжатие и синяя вспышка в точке нажатия. |
| 00:02.2–00:03 | Убирает ручку, маленький довольный кивок. |
| 00:03–00:04.5 | Поворачивается обратно к камере. |
| 00:04.5–00:08 | Спокойно парит по центру. |

```
From the idle hover in the center, the mascot turns to its left and taps an invisible menu item with a small hand, then returns.

TIMELINE (8 seconds):
[00:00–00:00.8] It hovers in the center facing the camera.
[00:00.8–00:01.6] It turns its body about 30 degrees to the viewer's left, eyes looking left.
[00:01.6–00:02.2] It extends a small rounded hand to the left and taps once; a slight squash and a soft blue pulse at the touch point.
[00:02.2–00:03] It pulls the hand back and gives a small satisfied nod.
[00:03–00:04.5] It turns back to face the camera.
[00:04.5–00:08] It hovers calmly in the center.

FRAMING: character centered; the hand reaches left but stays at least 25% away from the left edge.

STYLE: premium 3D character animation, Pixar-level polish. The character is made of glossy pearlescent white and electric-blue (#1A69F0) translucent petal-like shells swirling around a round dark-navy glass visor face. The eyes are soft glowing white shapes on the visor (normally two vertical rounded pills; the wink is a '<' shape). Subtle subsurface scattering in the shells, soft blue rim light, gentle bloom on the eyes only. BACKGROUND: pure flat black #000000 for the whole clip — no gradient, no floor, no shadow, no particles, no environment. CAMERA: locked-off static shot, eye level, no zoom, no pan, no cuts. The character never touches the frame edges and keeps a clear margin on all sides. CONSISTENCY: the design, proportions, colors and number of shells stay exactly as in the reference image in every frame. MOTION: smooth and weighty, ease-in/ease-out, small squash-and-stretch, no jitter. AUDIO: silent, no music, no voice.

AVOID: text, letters, numbers, logos, watermark, mouth, teeth, nose, human features, fingers (hands are simple rounded white mitten shapes), extra limbs, legs, face morphing, eye color change, purple or green tints, lens flare streaks, confetti, sparkles, background objects, camera shake, motion blur trails.
```

## F. Финал: машет и показывает на кнопку

- **Где в ролике:** Сцена 20 · 1:45–1:52 ролика. Берём 1,0–8,0 с клипа (7 с). Маскот в левой части кадра, справа от него — «SEO на автопилоте» и кнопка «5 дней бесплатно».
- **Режим и картинки:** Frames to Video: последний кадр = mascot-wink.png. Референс ручек — mascot-magnifier.png, если режим позволяет.
- **Кадр:** Персонаж в левой трети кадра, жест указывает вправо.

| Секунды клипа | Что делает маскот |
|---|---|
| 00:00–00:01 | Вплывает снизу слева в левую треть кадра, замедляясь. |
| 00:01–00:02 | Поворачивается к камере, глаза открыты. |
| 00:02–00:04 | Машет маленькой ручкой три раза, корпус слегка покачивается. |
| 00:04–00:05 | Показывает ручкой вправо — туда, где будет кнопка. |
| 00:05–00:06 | Убирает ручку и подмигивает «<». |
| 00:06–00:08 | Держит позу подмигивания почти неподвижно — точно как на картинке. |

```
The mascot says goodbye: it waves to the viewer, points to the right where the call-to-action button will be, and winks.

TIMELINE (8 seconds):
[00:00–00:01] It floats up from the lower left into the left third of the frame, decelerating.
[00:01–00:02] It turns toward the camera with open eyes.
[00:02–00:04] It waves a small rounded hand three times while the body sways slightly.
[00:04–00:05] It points with the hand to the right side of the frame.
[00:05–00:06] It lowers the hand and winks with the "<" eye.
[00:06–00:08] It holds the wink pose almost perfectly still, exactly as in the reference image.

FRAMING: character in the left third of the frame, the gesture points to the right.

STYLE: premium 3D character animation, Pixar-level polish. The character is made of glossy pearlescent white and electric-blue (#1A69F0) translucent petal-like shells swirling around a round dark-navy glass visor face. The eyes are soft glowing white shapes on the visor (normally two vertical rounded pills; the wink is a '<' shape). Subtle subsurface scattering in the shells, soft blue rim light, gentle bloom on the eyes only. BACKGROUND: pure flat black #000000 for the whole clip — no gradient, no floor, no shadow, no particles, no environment. CAMERA: locked-off static shot, eye level, no zoom, no pan, no cuts. The character never touches the frame edges and keeps a clear margin on all sides. CONSISTENCY: the design, proportions, colors and number of shells stay exactly as in the reference image in every frame. MOTION: smooth and weighty, ease-in/ease-out, small squash-and-stretch, no jitter. AUDIO: silent, no music, no voice.

AVOID: text, letters, numbers, logos, watermark, mouth, teeth, nose, human features, fingers (hands are simple rounded white mitten shapes), extra limbs, legs, face morphing, eye color change, purple or green tints, lens flare streaks, confetti, sparkles, background objects, camera shake, motion blur trails.
```

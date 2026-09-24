# AGENT.md — Pokedex Lite (React Native + TypeScript + Expo Router)

Este archivo es la guía de referencia para cualquier agente (humano o IA) que trabaje en este
proyecto. Resume las convenciones, estructura y decisiones de diseño del curso "Pokedex Lite"
(Instructor: Edwin Rozo Gómez), para que el código generado sea consistente con lo que el curso
enseña — nada de mezclar estilos que el material no contempla.

---

## 0. Resumen del proyecto

App de React Native (Expo + Expo Router) que consume la PokeAPI. Tres rutas:

| Ruta | Pantalla | Qué hace |
|---|---|---|
| `/` | Lista | Trae los primeros N Pokémon y los muestra en una lista/grilla |
| `/pokemon/[name]` | Detalle | Imagen, tipos y estadísticas al tocar un Pokémon |
| `/favoritos` (opcional, extra) | Favoritos | Pokémon marcados como favoritos, guardados localmente |

Duración estimada: 7–10 h. Dos formas de correr la app: **Plan A** (emulador Android) y
**Plan B** (web). Ambas se configuran una sola vez, en el Módulo 2.

---

## 1. Convenciones de código (no negociables)

### 1.1 Funciones: siempre arrow function
Nunca usar `function nombre() {}`. Siempre:
```ts
const nombreDeLaFuncion = (param: Tipo): TipoRetorno => { ... };
```

### 1.2 Exports — regla y única excepción
- **Regla general** (hooks, tipos, componentes reusables, funciones auxiliares):
  `export const NombreDeLaFuncion = (...) => { ... };` — el export va **al lado** de la
  declaración. Nunca `export default` fuera de `app/`.
- **Única excepción — archivos dentro de `app/` (rutas)**: Expo Router exige que el componente
  de pantalla sea el `export default` de ese archivo. Ahí la función se declara igual como
  arrow function, pero el export va al final:
  ```ts
  const HomeScreen = () => { ... };
  export default HomeScreen;
  ```
- `styles` (de `StyleSheet.create`) **nunca** lleva `export` — es interno de cada archivo.

### 1.3 Extensiones de archivo
- `.ts` → solo lógica (hooks, tipos), sin JSX.
- `.tsx` → componentes/pantallas, con JSX.

### 1.4 Tipado
- `interface` para formas de datos (props, respuestas de API) — no `type`, por convención del curso.
- Propiedades opcionales con `?`.
- `useState` con genérico explícito **solo** cuando el valor inicial es ambiguo (`[]`, `null`):
  `useState<Pokemon[]>([])`, `useState<string | null>(null)`. Si el valor inicial ya es claro
  (`useState(true)`, `useState("")`), no hace falta el genérico.
- `string | null` para "puede no haber cargado todavía".
- Nunca `any`. Usar `unknown` + verificación (`err instanceof Error`) en los `catch`.
- `as` solo como escape consciente, no como regla general.
- `?.` y `??` para acceso seguro y valores por defecto.
- `async` va antes de los paréntesis de parámetros en arrow functions: `async (x: string) => {}`.
- `tsconfig.json` generado por Expo con `strict: true` — **no tocar**.

### 1.5 Estilos (React Native, no CSS)
- Todo estilo va en `StyleSheet.create({...})`, pasado por el prop `style`.
- camelCase (`backgroundColor`, no `background-color`).
- Números sin unidad (`padding: 16`, interpretado como dp). Porcentajes sí como string (`"100%"`).
- Sin shorthand de `border`: `borderWidth`, `borderColor`, `borderStyle` por separado.
- No hay cascada (salvo `<Text>` anidado en `<Text>`): cada componente necesita su propio `style`.
- Estilos condicionales con array: `style={[styles.card, isFavorite && styles.cardFavorita]}`.
- Flexbox es el layout por defecto (`flexDirection: "column"` por defecto, a diferencia de la web).
  Trío más usado: `flexDirection`, `justifyContent`, `alignItems`, más `gap` y `flex: 1`.

### 1.6 Componentes base (equivalentes web → RN)
| Web | React Native |
|---|---|
| `<div>` | `<View>` |
| `<p>` / `<span>` | `<Text>` (todo texto va dentro de un `<Text>`) |
| `<img>` | `<Image>` (usa `source={{ uri }}`, no `src`) |
| `<input>` | `<TextInput>` |
| botón clickeable | `<Pressable>` / `<TouchableOpacity>` |
| — | `<ScrollView>` / `<FlatList>` (listas largas) |

---

## 2. Estructura de carpetas

```
pokedex-lite/
├── app/
│   ├── _layout.tsx           ← Stack raíz (export default)
│   ├── index.tsx             ← ruta "/" — Lista (export default)
│   ├── favoritos.tsx         ← ruta "/favoritos" (opcional, extra)
│   └── pokemon/
│       └── [name].tsx        ← ruta "/pokemon/[name]" — Detalle (export default)
├── hooks/
│   ├── usePokemonList.ts     ← export const
│   └── usePokemonDetail.ts   ← export const
├── types/
│   └── pokemon.ts            ← interfaces, export const al lado
├── assets/
├── tsconfig.json              ← no tocar
├── app.json
└── package.json
```

---

## 3. Setup del entorno (Módulo 2 — una sola vez)

### Requisitos base (ambos planes)
1. Node.js LTS (nodejs.org).
2. Verificar: `node -v` y `npm -v`.
3. VS Code (soporte TS integrado).

### Plan A — Emulador Android
1. JDK 17 (`brew install --cask zulu17` en macOS / `choco install -y microsoft-openjdk17` en
   Windows / OpenJDK 17 del gestor de paquetes en Linux).
2. Android Studio (developer.android.com/studio, instalación "Standard").
3. Verificar SDK: Settings → Languages & Frameworks → Android SDK (última Platform + Android
   Emulator + Build-Tools).
4. Variables de entorno:
   ```bash
   export ANDROID_HOME=$HOME/Library/Android/sdk   # macOS
   export PATH=$PATH:$ANDROID_HOME/platform-tools
   ```
   Verificar con `adb --version`.
5. Crear AVD (Virtual Device Manager → Create Virtual Device, modelo Pixel).
6. Encender el emulador desde el Device Manager.

### Plan B — Web
Nada adicional al paso 1. Expo Router sirve la versión web automáticamente.

### Extra — Expo Go
App en el celular físico (Play Store / App Store), tercera opción de prueba.

### Checklist antes de avanzar
- [ ] `node -v` y `npm -v` responden.
- [ ] `adb --version` responde (Plan A).
- [ ] Hay al menos un AVD creado (Plan A).

---

## 4. Comandos clave

```bash
# Crear el proyecto (ya trae TypeScript + Expo Router)
npx create-expo-app@latest pokedex-lite
cd pokedex-lite

# Limpiar plantilla de ejemplo (mueve contenido a app-example/)
npm run reset-project

# Levantar el servidor de desarrollo (Metro)
npx expo start
# → presiona "a" para emulador Android (Plan A)
# → presiona "w" para navegador (Plan B)
# → escanea el QR con Expo Go para celular físico

# Limpiar caché si Metro se queda pegado
npx expo start -c
```

---

## 5. Rutas con Expo Router

- Cada archivo dentro de `app/` es una ruta (file-based routing, como Next.js).
- `app/_layout.tsx` define el `Stack` y sus `Stack.Screen` con `options={{ title: ... }}`.
- `[name].tsx` (entre corchetes) = ruta dinámica; el parámetro se lee con
  `useLocalSearchParams<{ name: string }>()`.
- Navegación con `<Link href="/pokemon/pikachu" asChild>` o el hook `useRouter`.

---

## 6. Diseño responsive

- Preferir flexible sobre fijo: `flex`, `%`, `flexWrap` en vez de anchos en px.
- `useWindowDimensions()` para lógica reactiva al tamaño (rotación, resize en web):
  ```ts
  const { width } = useWindowDimensions();
  const columnas = width > 600 ? 3 : width > 380 ? 2 : 1;
  ```
- `FlatList` necesita `key={columnas}` para remontarse cuando cambia `numColumns` — **no es
  decorativo, es obligatorio**.
- `SafeAreaView` de `react-native-safe-area-context` solo si se arma una pantalla sin header.
- `Platform.select({ ios, android, web })` para diferencias puntuales (sombras, etc.) — no
  necesario en la versión mínima.

---

## 7. Consumo de la PokeAPI

Endpoints (sin API key):
- Lista: `GET https://pokeapi.co/api/v2/pokemon?limit=20&offset=0`
- Detalle: `GET https://pokeapi.co/api/v2/pokemon/{nombre-o-id}`

Tipos en `types/pokemon.ts`: `PokemonListItem`, `PokemonListResponse`, `PokemonType`,
`PokemonStat`, `PokemonDetail` (campos obtenidos inspeccionando la respuesta real de la API).

Patrón de hook (usar en `usePokemonList` y `usePokemonDetail`):
- `useState` para dato, `loading`, `error`.
- `useEffect` con flag `cancelled` para evitar `setState` tras desmontar.
- `try/catch/finally`, con `err instanceof Error` para el mensaje.
- Función interna de fetch **sin** export (no se usa fuera del hook); el hook en sí **con**
  `export const`.

---

## 8. Pantallas

- **`app/index.tsx`** (Lista): usa `usePokemonList`, `FlatList` con `numColumns` dinámico,
  `Link` a `/pokemon/[name]` envolviendo un `Pressable`.
- **`app/pokemon/[name].tsx`** (Detalle): usa `useLocalSearchParams` + `usePokemonDetail`,
  muestra imagen (`sprites.front_default`), tipos, altura, peso y estadísticas.
- Ambos archivos: función declarada como arrow function, `export default` al final (regla de
  archivos de ruta).

---

## 9. Checklist de verificación final

Con `npx expo start` corriendo:
- [ ] Plan A: presionar `a`, la app instala y abre; tocar un Pokémon navega al detalle; Fast
      Refresh funciona.
- [ ] Plan B: presionar `w`; redimensionar la ventana cambia la cantidad de columnas.

---

## 10. Troubleshooting

| Problema | Solución |
|---|---|
| `adb: command not found` | Agregar `platform-tools` al `PATH`, reiniciar terminal |
| Emulador no aparece con `a` | Abrirlo manualmente desde Android Studio primero |
| Metro pegado / no recarga | `npx expo start -c` |
| Error de red en fetch (emulador) | Verificar internet del emulador; para backend local propio usar `10.0.2.2`, no `localhost` |
| Estilo no se aplica | Recordar que no hay cascada — cada componente necesita su propio `style` |
| `numColumns` no cambia layout | Falta `key={columnas}` en el `FlatList` |

---

## 11. Extras opcionales (orden de dificultad sugerido)

1. Ruta `/favoritos` con `React.createContext` + `useState` (sin persistencia).
2. Persistencia con `@react-native-async-storage/async-storage`.
3. Buscador con `TextInput` (tipar el evento: `(text: string) => void`).
4. Cambiar `_layout.tsx` de `Stack` a `Tabs`.
5. Tests con Jest + `@testing-library/react-native` para `usePokemonList`.
6. Build real con `eas build` (fuera del alcance introductorio).

---

## 12. Reglas de oro para cualquier agente que edite este proyecto

1. **Nunca** usar `function nombre() {}` — siempre arrow function.
2. **Nunca** `export default` fuera de `app/`.
3. **Nunca** `any` — usar `unknown` + verificación, o tipar explícito.
4. **Nunca** CSS ni `className` — todo vía `StyleSheet.create` + prop `style`.
5. **Nunca** tocar `tsconfig.json`.
6. Todo texto va envuelto en `<Text>`.
7. Si se agrega una ruta nueva, actualizar `app/_layout.tsx` con su `Stack.Screen`.
8. Si se agrega un tipo de respuesta de API nueva, definirlo en `types/pokemon.ts` primero,
   inspeccionando el JSON real antes de escribir la interface.

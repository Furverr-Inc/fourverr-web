import { createContext, useContext, useState } from 'react';

const LanguageContext = createContext();

export const useLanguage = () => useContext(LanguageContext);

export const translations = {
  es: {
    // Navbar
    hello: 'Hola',
    publishGig: 'Publicar',
    beSeller: 'Ser Vendedor',
    logout: 'Salir',
    wishlist: 'Mi Wishlist',
    darkMode: 'Modo oscuro',
    lightMode: 'Modo claro',
    notifications: 'Mis Ventas',
    noNotifications: 'Sin notificaciones nuevas',
    noPendingNotif: 'No tienes ventas aún',
    fullPanel: 'Ver panel completo →',
    pending: 'Pendiente(s)',

    // Landing
    heroTitle: 'Encuentra el servicio',
    heroTitleItalic: 'freelance',
    heroSubtitle: 'adecuado de inmediato',
    support24: 'Soporte 24 horas',
    securePay: 'Pago seguro',
    popularServices: 'Servicios populares',
    ctaTitle: '¿Listo para comenzar?',
    ctaSubtitle: 'Únete a miles de freelancers y clientes',
    ctaButton: 'Comenzar Ahora',
    access: 'Acceder',
    seller: 'Vendedor',
    from: 'Desde',
    noServices: 'No hay servicios disponibles en este momento',

    // Auth
    welcome: 'Bienvenido de nuevo',
    userOrEmail: 'Usuario o Correo',
    password: 'Contraseña',
    login: 'Iniciar Sesión',
    loggingIn: 'Entrando...',
    newHere: '¿Nuevo aquí?',
    createAccount: 'Crea una cuenta',
    createAccountTitle: 'Crear Cuenta',
    joinCommunity: 'Únete a la comunidad de creativos',
    fullName: 'Nombre Completo',
    username: 'Usuario (Nickname)',
    email: 'Correo Electrónico',
    register: 'Registrarse',
    registering: 'Registrando...',
    alreadyHaveAccount: '¿Ya tienes cuenta?',
    signIn: 'Inicia sesión',

    // Home
    exploreServices: 'Explora Servicios Digitales',
    searchPlaceholder: 'Buscar servicios, cursos, recursos...',
    buyAndView: 'Ver y Comprar',
    noResults: 'Sin resultados',
    noResultsHint: 'Prueba con otras palabras o categoría',
    showing: 'Mostrando',
    of: 'de',
    products: 'producto(s)',
    loadMore: 'Ver más',

    // Perfil
    myActivity: 'Mi Actividad',
    myPurchases: 'Historial de Compras',
    myPublications: 'Mis Publicaciones',
    saved: 'Guardados',
    requestSeller: 'Solicitar ser Vendedor',
    pendingRequest: 'Tu solicitud está pendiente de aprobación.',
    editProfile: 'Editar',
    addDescription: 'Agrega una descripción editando tu perfil.',
    earningsPanel: 'Panel de Ganancias',
    availableBalance: 'Saldo disponible',
    totalEarned: 'Total ganado',
    completedSales: 'Ventas completadas',
    pendingLabel: 'Pendientes',
    avgPerSale: 'Promedio por venta',
    latestSales: 'Últimas ventas',
    noSalesYet: 'Aún no tienes ventas',
    noPurchasesYet: 'Aún no has realizado ninguna compra',
    purchasesTotal: 'compra(s) en total',
    morePurchases: 'compra(s) más',
    moreItems: 'más guardados',
    close: 'Cerrar',
    purchases: 'Compras',
    favorites: 'Favoritos',
    level: 'Nivel',

    // Membresía
    levelNew: 'Nuevo',
    levelActive: 'Activo',
    levelVip: 'VIP',

    // Rating
    reviews: 'Reseñas',
    noReviews: 'Aún no hay reseñas. ¡Sé el primero!',
    rateProduct: 'Calificar compra',
    ratingTitle: '¿Cómo fue tu experiencia?',
    ratingComment: 'Comparte tu experiencia (opcional)',
    submitRating: 'Publicar reseña',
    submittingRating: 'Publicando...',
    alreadyRated: 'Ya reseñaste este producto',
    ratingSuccess: '¡Reseña publicada! ⭐',
    ratingError: 'Error al publicar la reseña',
    verifiedBuyer: 'Comprador verificado',
    avgRating: 'Calificación promedio',

    // ProductoModal
    verifiedSeller: 'Vendedor verificado',
    description: 'Descripción',
    noDescription: 'Este vendedor no ha añadido una descripción.',
    qa: 'Preguntas y Respuestas',
    askSeller: 'Pregúntale al vendedor...',
    noQuestions: '¡Sé el primero en preguntar!',
    reply: 'Responder',
    cancel: 'Cancelar',
    buyNow: 'Comprar ahora',
    removeWishlist: 'Quitar de wishlist',
    addWishlist: 'Agregar a wishlist',

    // Categorías
    categories: {
      all: 'Todos',
      gig: 'Servicio / Gig',
      course: 'Curso Digital',
      download: 'Descargable',
      subscription: 'Suscripción',
      product: 'Producto',
      consulting: 'Consultoría',
      design: 'Diseño Gráfico',
      webDev: 'Dev Web',
      marketing: 'Marketing',
      music: 'Música / Audio',
    },
  },

  en: {
    // Navbar
    hello: 'Hello',
    publishGig: 'Publish',
    beSeller: 'Become a Seller',
    logout: 'Sign Out',
    wishlist: 'My Wishlist',
    darkMode: 'Dark mode',
    lightMode: 'Light mode',
    notifications: 'My Sales',
    noNotifications: 'No new notifications',
    noPendingNotif: 'No sales yet',
    fullPanel: 'View full dashboard →',
    pending: 'Pending',

    // Landing
    heroTitle: 'Find the right',
    heroTitleItalic: 'freelance',
    heroSubtitle: 'service immediately',
    support24: '24-hour support',
    securePay: 'Secure payment',
    popularServices: 'Popular services',
    ctaTitle: 'Ready to get started?',
    ctaSubtitle: 'Join thousands of freelancers and clients',
    ctaButton: 'Start Now',
    access: 'Sign In',
    seller: 'Seller',
    from: 'From',
    noServices: 'No services available at this time',

    // Auth
    welcome: 'Welcome back',
    userOrEmail: 'Username or Email',
    password: 'Password',
    login: 'Sign In',
    loggingIn: 'Signing in...',
    newHere: 'New here?',
    createAccount: 'Create an account',
    createAccountTitle: 'Create Account',
    joinCommunity: 'Join the creative community',
    fullName: 'Full Name',
    username: 'Username (Nickname)',
    email: 'Email Address',
    register: 'Register',
    registering: 'Registering...',
    alreadyHaveAccount: 'Already have an account?',
    signIn: 'Sign in',

    // Home
    exploreServices: 'Explore Digital Services',
    searchPlaceholder: 'Search services, courses, resources...',
    buyAndView: 'View & Buy',
    noResults: 'No results',
    noResultsHint: 'Try different words or category',
    showing: 'Showing',
    of: 'of',
    products: 'product(s)',
    loadMore: 'Load more',

    // Perfil
    myActivity: 'My Activity',
    myPurchases: 'Purchase History',
    myPublications: 'My Listings',
    saved: 'Saved',
    requestSeller: 'Become a Seller',
    pendingRequest: 'Your request is pending approval.',
    editProfile: 'Edit',
    addDescription: 'Add a description by editing your profile.',
    earningsPanel: 'Earnings Dashboard',
    availableBalance: 'Available balance',
    totalEarned: 'Total earned',
    completedSales: 'Completed sales',
    pendingLabel: 'Pending',
    avgPerSale: 'Avg per sale',
    latestSales: 'Latest sales',
    noSalesYet: "You don't have any sales yet",
    noPurchasesYet: "You haven't made any purchases yet",
    purchasesTotal: 'purchase(s) total',
    morePurchases: 'more purchase(s)',
    moreItems: 'more saved',
    close: 'Close',
    purchases: 'Purchases',
    favorites: 'Favorites',
    level: 'Level',

    // Membership
    levelNew: 'New',
    levelActive: 'Active',
    levelVip: 'VIP',

    // Rating
    reviews: 'Reviews',
    noReviews: 'No reviews yet. Be the first!',
    rateProduct: 'Rate purchase',
    ratingTitle: 'How was your experience?',
    ratingComment: 'Share your experience (optional)',
    submitRating: 'Post review',
    submittingRating: 'Posting...',
    alreadyRated: 'You already reviewed this product',
    ratingSuccess: 'Review posted! ⭐',
    ratingError: 'Error posting the review',
    verifiedBuyer: 'Verified buyer',
    avgRating: 'Average rating',

    // ProductoModal
    verifiedSeller: 'Verified seller',
    description: 'Description',
    noDescription: 'This seller has not added a description.',
    qa: 'Questions & Answers',
    askSeller: 'Ask the seller...',
    noQuestions: 'Be the first to ask!',
    reply: 'Reply',
    cancel: 'Cancel',
    buyNow: 'Buy now',
    removeWishlist: 'Remove from wishlist',
    addWishlist: 'Add to wishlist',

    // Categories
    categories: {
      all: 'All',
      gig: 'Service / Gig',
      course: 'Digital Course',
      download: 'Downloadable',
      subscription: 'Subscription',
      product: 'Product',
      consulting: 'Consulting',
      design: 'Graphic Design',
      webDev: 'Web Dev',
      marketing: 'Marketing',
      music: 'Music / Audio',
    },
  },
};

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(
    () => localStorage.getItem('language') || 'es'
  );

  const switchLanguage = (newLang) => {
    setLang(newLang);
    localStorage.setItem('language', newLang);
  };

  const t = translations[lang];

  return (
    <LanguageContext.Provider value={{ lang, switchLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

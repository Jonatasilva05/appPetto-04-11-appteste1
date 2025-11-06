// app/hooks/useProtectedRoute.ts
import { useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';

// Adicionamos o parâmetro 'isLoading'
export function useProtectedRoute(session: string | null, isLoading: boolean) {
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    // <-- PONTO CHAVE: Se a sessão ainda está carregando, não faça nada.
    if (isLoading) {
      return; 
    }

    const inAuthGroup = segments[0] === '(auth)';

    // Se NÃO tem sessão e NÃO está na área de autenticação, vai para o login.
    if (!session && !inAuthGroup) {
      router.replace('/(auth)/login');
    } 
    // Se TEM sessão e está tentando acessar a área de autenticação, vai para a home.
    else if (session && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [session, isLoading, segments, router]); // <-- Adicionamos isLoading à lista de dependências
}




// // app/hooks/useProtectedRoute.ts
// import { useEffect } from 'react';
// import { useRouter, useSegments } from 'expo-router';

// export function useProtectedRoute(session: string | null) {
//   const segments = useSegments();
//   const router = useRouter();

//   useEffect(() => {
//     const inTabsGroup = segments[0] === '(tabs)';

//     if (!session && inTabsGroup) {
//       // Redireciona para a tela de login se o usuário não estiver logado
//       // e tentando acessar uma rota protegida.
//       router.replace('/login');
//     } else if (session && !inTabsGroup) {
//       // Redireciona para a tela inicial se o usuário já estiver logado
//       // e tentar acessar a tela de login, por exemplo.
//       // Este 'else if' pode ser ajustado dependendo da sua necessidade.
//       // Por exemplo, se você não quiser redirecionar de 'cadastro',
//       // pode adicionar `&& segments[0] !== 'cadastro'`
//     }
//   }, [session, segments, router]);
// }

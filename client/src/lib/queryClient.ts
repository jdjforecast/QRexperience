import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

// Overload signatures
export async function apiRequest(method: string, url: string, data?: unknown): Promise<Response>;
export async function apiRequest(url: string, options?: RequestInit): Promise<Response>;

// Implementation
export async function apiRequest(
  methodOrUrl: string,
  urlOrOptions?: string | RequestInit,
  data?: unknown
): Promise<Response> {
  let url: string;
  let options: RequestInit = {};
  
  // Check which overload is being used
  if (urlOrOptions && typeof urlOrOptions === 'string') {
    // First overload: apiRequest('GET', '/api/users', data)
    const method = methodOrUrl;
    url = urlOrOptions;
    
    options = {
      method,
      headers: data ? { "Content-Type": "application/json" } : {},
      body: data ? JSON.stringify(data) : undefined,
      credentials: "include",
    };
  } else {
    // Second overload: apiRequest('/api/users', { method: 'GET', ... })
    url = methodOrUrl;
    
    if (urlOrOptions && typeof urlOrOptions !== 'string') {
      options = { ...urlOrOptions };
    } else {
      options = {};
    }
    
    options.credentials = "include";
    
    // Ensure headers exist if not provided
    if (!options.headers) {
      options.headers = {};
    }
  }

  const res = await fetch(url, options);
  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey[0] as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});

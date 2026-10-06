import { useMutation, useQuery } from '@tanstack/react-query';
import { loginUser, registerUser, getProfile } from '@/lib/auth';
import useAuthStore from '@/store/authStore';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export const useLogin = () => {
  const { setAuth } = useAuthStore();
  const router = useRouter();
  return useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
      setAuth(data.user, data.access, data.refresh);
      toast.success(`Welcome back, ${data.user.username}!`);
      router.push('/');
    },
    onError: () => toast.error('Invalid username or password'),
  });
};

export const useRegister = () => {
  const { setAuth } = useAuthStore();
  const router = useRouter();
  return useMutation({
    mutationFn: registerUser,
    onSuccess: (data) => {
      setAuth(data.user, data.access, data.refresh);
      toast.success('Account created successfully!');
      router.push('/dashboard');
    },
    onError: () => toast.error('Registration failed. Try again.'),
  });
};

export const useProfile = () =>
  useQuery({ queryKey: ['profile'], queryFn: getProfile });
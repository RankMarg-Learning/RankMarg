import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/lib/queryKeys';
import { getQueryConfig } from '@/lib/queryConfig';
import axios from 'axios';

// const fetchHomeData = async () => {
//     const { data } = await api.get('/v.1.0/home?subtopicsCount=3&sessionsCount=3')
//     return data
// }

export function useHome() {
    const { data, isLoading, isError, error } = useQuery({
        queryKey: queryKeys.dashboard.home(),
        queryFn: async() => await axios.get('https://api.rankmarg.in/api/dashboard?subtopicsCount=3&sessionsCount=3',{
            headers: {
                'Content-Type': 'application/json',
                'origin': 'https://rankmarg.in',
                'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYxZTZhZWJjLTAwZTktNGU0ZC1hMzc5LTAzYjUxMzhjOTNlNiIsInBsYW4iOnsiaWQiOm51bGwsInN0YXR1cyI6IlRSSUFMIiwiZW5kQXQiOiIyMDI1LTA5LTE2VDE4OjA5OjA0LjYyM1oifSwiZXhhbUNvZGUiOiJORUVUIiwiaWF0IjoxNzU3MjU4OTc2LCJleHAiOjE3NTk4NTA5NzZ9.V_Gz9ca37Pkf_yFPbPV1tc4-zCBXSyAmmU6_NEiOrCE`
            }
        }),
        ...getQueryConfig('DYNAMIC'),
    });

    const payload = data?.data?.data;

    return {
        dashboardBasic: payload?.dashboardData,
        currentStudies: payload?.currentStudies,
        session: payload?.sessions,
        isLoading,
        isError,
        error,
    }
}

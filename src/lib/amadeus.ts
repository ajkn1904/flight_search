import axios from 'axios';

const AMADEUS_API_KEY = import.meta.env.VITE_AMADEUS_API_KEY;
const AMADEUS_API_SECRET = import.meta.env.VITE_AMADEUS_API_SECRET;

async function getAccessToken() {
  try {
    const response = await axios.post('https://test.api.amadeus.com/v1/security/oauth2/token', 
      `grant_type=client_credentials&client_id=${AMADEUS_API_KEY}&client_secret=${AMADEUS_API_SECRET}`,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );
    //console.log(response);
    return response.data.access_token;
  } catch (error) {
    console.error('Error getting Amadeus access token:', error);
    throw error;
  }
}

export async function searchFlights(params: {
  originLocationCode: string;
  destinationLocationCode: string;
  departureDate: string;
  returnDate?: string;
  adults: number;
  children?: number;
  infants?: number;
  travelClass?: string;
  nonStop?: boolean;
  currencyCode?: string;
  max?: number;
}) {
  try {
    const token = await getAccessToken();
    
    const queryParams = new URLSearchParams({
      originLocationCode: params.originLocationCode,
      destinationLocationCode: params.destinationLocationCode,
      departureDate: params.departureDate,
      adults: params.adults.toString(),
      currencyCode: params.currencyCode || 'USD',
      max: params.max?.toString() || '10'
    });

    if (params.returnDate) {
      queryParams.append('returnDate', params.returnDate);
    }
    
    if (params.children) {
      queryParams.append('children', params.children.toString());
    }
    
    if (params.infants) {
      queryParams.append('infants', params.infants.toString());
    }
    
    if (params.travelClass) {
      queryParams.append('travelClass', params.travelClass);
    }
    
    if (params.nonStop !== undefined) {
      queryParams.append('nonStop', params.nonStop.toString());
    }

    const res = await axios.get(
      `https://test.api.amadeus.com/v2/shopping/flight-offers?${queryParams.toString()}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    //console.log(res);
    return res.data;
  } catch (error) {
    console.error('Error searching flights:', error);
    throw error;
  }
}

export async function getAirportSuggestions(keyword: string) {
  try {
    const token = await getAccessToken();
    
    const response = await axios.get(
      `https://test.api.amadeus.com/v1/reference-data/locations`,
      {
        params: {
          subType: 'AIRPORT,CITY',
          keyword: keyword,
          'page[limit]': 20,
          'page[offset]': 0,
          sort: 'analytics.travelers.score',
          view: 'FULL'
        },
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    return response.data.data;
  } catch (error) {
    console.error('Error getting airport suggestions:', error);
    throw error;
  }
}
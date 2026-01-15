// Test script để debug authentication trong browser console
// Mở http://localhost:3000, đăng nhập, sau đó paste script này vào Console

console.log('=== AUTHENTICATION DEBUG ===');

// 1. Kiểm tra token trong localStorage
const token = localStorage.getItem('accessToken');
console.log('1. Token in localStorage:', token ? `${token.substring(0, 50)}...` : 'NOT FOUND');

// 2. Test login API
async function testLogin() {
    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'admin@smart.restaurant',
                password: 'password@123'
            })
        });
        const data = await response.json();
        console.log('2. Login API response:', data);
        if (data.accessToken) {
            localStorage.setItem('accessToken', data.accessToken);
            console.log('   ✅ Token saved to localStorage');
        }
        return data.accessToken;
    } catch (error) {
        console.error('2. Login failed:', error);
    }
}

// 3. Test create product API
async function testCreateProduct() {
    const token = localStorage.getItem('accessToken');
    if (!token) {
        console.error('3. No token found. Run testLogin() first');
        return;
    }

    try {
        const response = await fetch('http://localhost:5000/products', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                name: 'Test Product from Console',
                description: 'Testing',
                price: '99000',
                categoryName: 'Món Chính',
                status: 'AVAILABLE'
            })
        });

        console.log('3. Create Product Response Status:', response.status);

        if (!response.ok) {
            const error = await response.json();
            console.error('   ❌ Error:', error);
            return;
        }

        const data = await response.json();
        console.log('   ✅ Product created:', data);
        return data;
    } catch (error) {
        console.error('3. Create product failed:', error);
    }
}

// 4. Chạy tất cả tests
async function runAllTests() {
    console.log('\n=== RUNNING ALL TESTS ===\n');
    await testLogin();
    await new Promise(resolve => setTimeout(resolve, 500));
    await testCreateProduct();
    console.log('\n=== TESTS COMPLETE ===');
}

console.log('\nAvailable commands:');
console.log('- testLogin()          : Test login and save token');
console.log('- testCreateProduct()  : Test creating a product');
console.log('- runAllTests()        : Run all tests');
console.log('\nExample: runAllTests()');

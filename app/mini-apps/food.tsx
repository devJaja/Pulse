import { View, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Modal, Image } from 'react-native';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { ArrowLeft, UtensilsCrossed, Search, ShoppingCart, Plus, Minus, MapPin, Clock } from 'lucide-react-native';
import { router } from 'expo-router';
import { useState } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { toast } from 'sonner-native';

const categories = ['All', 'Pizza', 'Burgers', 'Sushi', 'Desserts', 'Drinks'];

const menuItems = [
  { id: 1, name: 'Margherita Pizza', category: 'Pizza', price: 0.08, image: '🍕', description: 'Classic tomato and mozzarella' },
  { id: 2, name: 'Pepperoni Pizza', category: 'Pizza', price: 0.1, image: '🍕', description: 'Loaded with pepperoni' },
  { id: 3, name: 'Cheeseburger', category: 'Burgers', price: 0.06, image: '🍔', description: 'Juicy beef patty with cheese' },
  { id: 4, name: 'Bacon Burger', category: 'Burgers', price: 0.09, image: '🍔', description: 'Burger with crispy bacon' },
  { id: 5, name: 'California Roll', category: 'Sushi', price: 0.12, image: '🍣', description: 'Fresh sushi roll' },
  { id: 6, name: 'Salmon Nigiri', category: 'Sushi', price: 0.15, image: '🍣', description: 'Premium salmon sushi' },
  { id: 7, name: 'Chocolate Cake', category: 'Desserts', price: 0.05, image: '🍰', description: 'Rich chocolate dessert' },
  { id: 8, name: 'Ice Cream', category: 'Desserts', price: 0.04, image: '🍨', description: 'Creamy vanilla ice cream' },
  { id: 9, name: 'Cola', category: 'Drinks', price: 0.02, image: '🥤', description: 'Refreshing soft drink' },
  { id: 10, name: 'Fresh Juice', category: 'Drinks', price: 0.03, image: '🧃', description: 'Freshly squeezed juice' },
];

export default function FoodOrderingScreen() {
  const { balance } = useWallet();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<Record<number, number>>({});
  const [showCart, setShowCart] = useState(false);
  const [isOrdering, setIsOrdering] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState('');

  const filteredItems = menuItems.filter(item => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const addToCart = (itemId: number) => {
    setCart(prev => ({ ...prev, [itemId]: (prev[itemId] || 0) + 1 }));
    toast.success('Added to cart');
  };

  const removeFromCart = (itemId: number) => {
    setCart(prev => {
      const newCart = { ...prev };
      if (newCart[itemId] > 1) {
        newCart[itemId]--;
      } else {
        delete newCart[itemId];
      }
      return newCart;
    });
  };

  const cartItems = Object.entries(cart).map(([id, quantity]) => {
    const item = menuItems.find(i => i.id === parseInt(id));
    return item ? { ...item, quantity } : null;
  }).filter(Boolean);

  const totalPrice = cartItems.reduce((sum, item) => sum + (item!.price * item!.quantity), 0);
  const totalItems = Object.values(cart).reduce((sum, qty) => sum + qty, 0);

  const handlePlaceOrder = async () => {
    if (!deliveryAddress.trim()) {
      toast.error('Please enter delivery address');
      return;
    }

    if (totalPrice > balance) {
      toast.error('Insufficient balance');
      return;
    }

    if (cartItems.length === 0) {
      toast.error('Cart is empty');
      return;
    }

    setIsOrdering(true);

    // Simulate order processing
    setTimeout(() => {
      setIsOrdering(false);
      setShowCart(false);
      setCart({});
      setDeliveryAddress('');
      toast.success('Order placed successfully! Estimated delivery: 30 mins');
    }, 2000);
  };

  return (
    <View className="flex-1 bg-background">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="bg-orange-600 px-4 pb-8 pt-12">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-3">
              <TouchableOpacity onPress={() => router.back()}>
                <Icon as={ArrowLeft} size={24} className="text-white" />
              </TouchableOpacity>
              <Text className="text-2xl font-bold text-white">Food Delivery</Text>
            </View>
            <TouchableOpacity onPress={() => setShowCart(true)} className="relative">
              <Icon as={ShoppingCart} size={24} className="text-white" />
              {totalItems > 0 && (
                <View className="absolute -right-2 -top-2 h-5 w-5 items-center justify-center rounded-full bg-red-500">
                  <Text className="text-xs font-bold text-white">{totalItems}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          <View className="mt-6 items-center">
            <View className="h-20 w-20 items-center justify-center rounded-full bg-white/20">
              <Icon as={UtensilsCrossed} size={40} className="text-white" />
            </View>
            <Text className="mt-3 text-center text-sm text-white/90">
              Order delicious food and pay with MON
            </Text>
          </View>

          {/* Search Bar */}
          <View className="mt-6 flex-row items-center gap-2 rounded-2xl bg-white px-4 py-3">
            <Icon as={Search} size={20} className="text-gray-400" />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search for food..."
              className="flex-1 text-base text-foreground"
              placeholderTextColor="#727285"
            />
          </View>
        </View>

        {/* Categories */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mt-6 px-4"
          contentContainerStyle={{ gap: 8 }}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              onPress={() => setSelectedCategory(category)}
              className={`rounded-full px-6 py-2 ${
                selectedCategory === category
                  ? 'bg-orange-600'
                  : 'bg-card'
              }`}
            >
              <Text
                className={`font-semibold ${
                  selectedCategory === category
                    ? 'text-white'
                    : 'text-foreground'
                }`}
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Menu Items */}
        <View className="mt-6 px-4 pb-6">
          <Text className="text-xl font-bold">Menu</Text>
          <View className="mt-4 gap-3">
            {filteredItems.map((item) => (
              <View key={item.id} className="overflow-hidden rounded-2xl bg-card">
                <View className="flex-row gap-4 p-4">
                  <View className="h-20 w-20 items-center justify-center rounded-xl bg-orange-100">
                    <Text className="text-4xl">{item.image}</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-lg font-bold">{item.name}</Text>
                    <Text className="mt-1 text-sm text-muted-foreground">{item.description}</Text>
                    <View className="mt-2 flex-row items-center justify-between">
                      <Text className="text-lg font-bold text-orange-600">
                        {item.price.toFixed(3)} MON
                      </Text>
                      {cart[item.id] ? (
                        <View className="flex-row items-center gap-2">
                          <TouchableOpacity
                            onPress={() => removeFromCart(item.id)}
                            className="h-8 w-8 items-center justify-center rounded-full bg-orange-100"
                          >
                            <Icon as={Minus} size={16} className="text-orange-600" />
                          </TouchableOpacity>
                          <Text className="w-8 text-center font-bold">{cart[item.id]}</Text>
                          <TouchableOpacity
                            onPress={() => addToCart(item.id)}
                            className="h-8 w-8 items-center justify-center rounded-full bg-orange-600"
                          >
                            <Icon as={Plus} size={16} className="text-white" />
                          </TouchableOpacity>
                        </View>
                      ) : (
                        <TouchableOpacity
                          onPress={() => addToCart(item.id)}
                          className="rounded-full bg-orange-600 px-4 py-2"
                        >
                          <Text className="font-semibold text-white">Add</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Cart Modal */}
      <Modal
        visible={showCart}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCart(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="max-h-[80%] rounded-t-3xl bg-background pb-8">
            <View className="items-center py-4">
              <View className="h-1 w-12 rounded-full bg-gray-300" />
            </View>
            
            <View className="px-6">
              <Text className="text-2xl font-bold">Your Order</Text>
              
              {cartItems.length === 0 ? (
                <View className="items-center py-10">
                  <Text className="text-muted-foreground">Your cart is empty</Text>
                </View>
              ) : (
                <ScrollView className="mt-4 max-h-64">
                  {cartItems.map((item) => (
                    <View key={item!.id} className="mb-3 flex-row items-center justify-between">
                      <View className="flex-1">
                        <Text className="font-semibold">{item!.name}</Text>
                        <Text className="text-sm text-muted-foreground">
                          {item!.quantity} x {item!.price.toFixed(3)} MON
                        </Text>
                      </View>
                      <Text className="font-bold">
                        {(item!.price * item!.quantity).toFixed(3)} MON
                      </Text>
                    </View>
                  ))}
                </ScrollView>
              )}

              {/* Delivery Address */}
              <View className="mt-4">
                <Text className="mb-2 font-semibold">Delivery Address</Text>
                <View className="flex-row items-center gap-2 rounded-xl bg-card px-4 py-3">
                  <Icon as={MapPin} size={20} className="text-orange-600" />
                  <TextInput
                    value={deliveryAddress}
                    onChangeText={setDeliveryAddress}
                    placeholder="Enter your address..."
                    className="flex-1 text-base text-foreground"
                    placeholderTextColor="#727285"
                  />
                </View>
              </View>

              {/* Delivery Time */}
              <View className="mt-4 flex-row items-center gap-2 rounded-xl bg-orange-50 dark:bg-orange-950 px-4 py-3">
                <Icon as={Clock} size={20} className="text-orange-600" />
                <Text className="text-sm text-orange-700 dark:text-orange-300">
                  Estimated delivery: 30-45 minutes
                </Text>
              </View>

              {/* Total */}
              <View className="mt-4 rounded-xl bg-card p-4">
                <View className="flex-row items-center justify-between">
                  <Text className="text-lg font-semibold">Total</Text>
                  <Text className="text-2xl font-bold text-orange-600">
                    {totalPrice.toFixed(3)} MON
                  </Text>
                </View>
                <Text className="mt-1 text-sm text-muted-foreground">
                  Balance: {balance.toFixed(4)} MON
                </Text>
              </View>

              {/* Action Buttons */}
              <View className="mt-4 flex-row gap-3">
                <TouchableOpacity
                  onPress={() => setShowCart(false)}
                  className="flex-1 items-center rounded-xl bg-gray-200 dark:bg-gray-800 py-4"
                >
                  <Text className="font-semibold">Continue Shopping</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handlePlaceOrder}
                  disabled={isOrdering || cartItems.length === 0}
                  className={`flex-1 items-center rounded-xl py-4 ${
                    isOrdering || cartItems.length === 0 ? 'bg-gray-300' : 'bg-orange-600'
                  }`}
                >
                  {isOrdering ? (
                    <ActivityIndicator color="#ffffff" />
                  ) : (
                    <Text className="font-semibold text-white">Place Order</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

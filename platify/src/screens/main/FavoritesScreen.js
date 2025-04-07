import React, { useEffect } from 'react';
import { StyleSheet, FlatList } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { 
  Box, 
  Text, 
  Heading, 
  VStack, 
  HStack, 
  Center, 
  Icon,
  Pressable,
  Spinner,
  Badge,
  Divider,
  useToast
} from 'native-base';
import { Ionicons } from '@expo/vector-icons';
import { fetchFavoriteRecipes, removeRecipe } from '../../store/slices/recipeSlice';
import { SwipeListView } from 'react-native-swipe-list-view';

const FavoritesScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const toast = useToast();
  const { user } = useSelector((state) => state.auth);
  const { favoriteRecipes, isLoading } = useSelector((state) => state.recipes);

  useEffect(() => {
    if (user) {
      dispatch(fetchFavoriteRecipes(user.uid));
    }
  }, [dispatch, user]);

  const handleRecipePress = (recipe) => {
    navigation.navigate('RecipeDetail', { recipe });
  };

  const handleDeleteRecipe = async (recipeId) => {
    await dispatch(removeRecipe({ recipeId, userId: user.uid }));
    
    toast.show({
      description: "Recipe removed from favorites",
      placement: "top"
    });
  };

  // Map skill level to color
  const getSkillColor = (level) => {
    switch(level) {
      case 'beginner': return 'green.500';
      case 'intermediate': return 'orange.500';
      case 'advanced': return 'red.500';
      default: return 'green.500';
    }
  };
  
  // Get badge color scheme based on skill level
  const getBadgeColorScheme = (level) => {
    switch(level) {
      case 'beginner': return 'green';
      case 'intermediate': return 'orange';
      case 'advanced': return 'red';
      default: return 'green';
    }
  };

  const renderItem = ({ item }) => (
    <Box 
      bg="darkCard" 
      _light={{ bg: "white" }}
      rounded="lg" 
      shadow={2} 
      p={4} 
      m={2}
      borderLeftWidth={4}
      borderLeftColor={getSkillColor(item.skill_level)}
      alignSelf="center"
    >
      <Pressable onPress={() => handleRecipePress(item)}>
        <HStack justifyContent="space-between" alignItems="center">
          <VStack space={1} flex={1}>
            <Text fontSize="md" fontWeight="bold" numberOfLines={1} color="darkText" _light={{ color: "gray.800" }}>
              {item.name}
            </Text>
            <HStack space={2} alignItems="center">
              <Icon as={Ionicons} name="time-outline" size="xs" color="darkSubtext" _light={{ color: "gray.500" }} />
              <Text fontSize="xs" color="darkSubtext" _light={{ color: "gray.500" }}>
                {item.time_estimate}
              </Text>
            </HStack>
          </VStack>
          <Badge 
            colorScheme={getBadgeColorScheme(item.skill_level)}
            variant="solid"
            rounded="full"
            _text={{ fontSize: 'xs' }}
          >
            {item.skill_level}
          </Badge>
        </HStack>
      </Pressable>
    </Box>
  );

  const renderHiddenItem = ({ item }) => (
    <HStack flex={1} pl={2} pr={2} my={2} ml={2} mr={2}>
      <Pressable
        w={70}
        ml="auto"
        bg="red.500"
        justifyContent="center"
        alignItems="center"
        onPress={() => handleDeleteRecipe(item.id)}
        _pressed={{ opacity: 0.5 }}
        rounded="lg"
        shadow={2}
      >
        <Icon as={Ionicons} name="trash" color="white" size="sm" />
      </Pressable>
    </HStack>
  );

  return (
    <Box flex={1} bg="darkBg" _light={{ bg: "white" }} safeArea>
      <VStack space={4} flex={1} p={4}>
          <Heading size="lg" color="darkText" _light={{ color: "coolGray.800" }}>
            Favorite Recipes
          </Heading>
          
          <Divider bg="darkBorder" _light={{ bg: "gray.200" }} />
          
          {isLoading ? (
            <Center flex={1}>
              <Spinner size="lg" color="primary.400" _light={{ color: "green.500" }} />
            </Center>
          ) : favoriteRecipes.length > 0 ? (
            <SwipeListView
              data={favoriteRecipes}
              renderItem={renderItem}
              renderHiddenItem={renderHiddenItem}
              rightOpenValue={-70}
              previewRowKey={'0'}
              previewOpenValue={-40}
              previewOpenDelay={3000}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <Center flex={1}>
              <Icon 
                as={Ionicons} 
                name="heart-outline" 
                size="4xl" 
                color="darkBorder" 
                _light={{ color: "gray.300" }}
                alignSelf="center"
              />
              <Text color="darkSubtext" _light={{ color: "gray.500"}} mt={2} alignSelf="center">
                No favorite recipes yet
              </Text>
              <Pressable 
                mt={4} 
                bg="green.500" 
                px={4} 
                py={2} 
                rounded="md"
                shadow={2}
                width="280"
                alignSelf="center"
                onPress={() => navigation.navigate('Search')}
                _pressed={{ opacity: 0.8 }}
              >
                <Text color="white" fontWeight="medium">
                  Find Recipes
                </Text>
              </Pressable>
            </Center>
          )}
      </VStack>
    </Box>
  );
};

export default FavoritesScreen;

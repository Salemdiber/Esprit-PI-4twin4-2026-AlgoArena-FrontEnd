import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import playgroundChallengesService from "../../services/playgroundChallengesService";
import {
  Box,
  Container,
  Heading,
  Text,
  SimpleGrid,
  Badge,
  Button,
  VStack,
  HStack,
  Tag,
  Spinner,
  Alert,
  AlertIcon,
  Input,
  Select,
  useColorModeValue,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Divider,
} from "@chakra-ui/react";

function ChallengeList({ onSelect, onRandom, loading, error, challenges, navigate }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const filteredChallenges = useMemo(() => {
    return challenges.filter((ch) => {
      const matchSearch = ch.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (ch.tags && ch.tags.join(" ").toLowerCase().includes(searchTerm.toLowerCase()));
      const matchDifficulty = difficultyFilter ? ch.difficulty === difficultyFilter : true;
      return matchSearch && matchDifficulty;
    });
  }, [challenges, searchTerm, difficultyFilter]);

  const totalPages = Math.ceil(filteredChallenges.length / itemsPerPage);
  const currentChallenges = filteredChallenges.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const cardBg = useColorModeValue("white", "gray.800");

  if (loading) return <Box textAlign="center" py={10}><Spinner size="xl" /></Box>;
  if (error) return <Alert status="error"><AlertIcon />{error}</Alert>;

  return (
    <Container maxW="container.xl" py={10}>
      <HStack justifyContent="space-between" mb={8} flexWrap="wrap">
        <Heading size="lg">Playground Challenges</Heading>
        <Button colorScheme="purple" onClick={onRandom}>
          Practice Random Challenge
        </Button>
      </HStack>

      <HStack mb={8} spacing={4} flexWrap="wrap">
        <Input 
          placeholder="Search by title or tag..." 
          value={searchTerm} 
          onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} 
          maxW={{ base: "100%", md: "300px" }}
          bg={useColorModeValue("white", "gray.800")}
        />
        <Select 
          placeholder="All Difficulties" 
          value={difficultyFilter} 
          onChange={(e) => { setDifficultyFilter(e.target.value); setCurrentPage(1); }} 
          maxW={{ base: "100%", md: "200px" }}
          bg={useColorModeValue("white", "gray.800")}
        >
          <option value="Easy">Easy</option>
          <option value="Medium">Medium</option>
          <option value="Hard">Hard</option>
        </Select>
      </HStack>

      {filteredChallenges.length === 0 ? (
        <Text>No challenges found. Try adjusting your filters.</Text>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {currentChallenges.map((ch) => (
            <Card key={ch._id || ch.id} bg={cardBg} shadow="md" _hover={{ shadow: "xl", transform: "translateY(-4px)" }} transition="all 0.2s">
              <CardHeader pb={2}>
                <HStack justifyContent="space-between">
                  <Heading size="md" noOfLines={1}>{ch.title}</Heading>
                  {ch.difficulty && (
                    <Badge colorScheme={ch.difficulty === "Easy" ? "green" : ch.difficulty === "Medium" ? "orange" : "red"}>
                      {ch.difficulty}
                    </Badge>
                  )}
                </HStack>
              </CardHeader>
              <CardBody py={2}>
                <Text noOfLines={3} color="gray.500" fontSize="sm">{ch.description}</Text>
                <HStack mt={4} spacing={2} flexWrap="wrap">
                  {ch.tags && ch.tags.map((tag) => (
                    <Tag key={tag} size="sm" colorScheme="blue" borderRadius="full">
                      {tag}
                    </Tag>
                  ))}
                </HStack>
              </CardBody>
              <CardFooter pt={2}>
                <Button 
                  colorScheme="cyan" 
                  size="sm" 
                  width="full"
                  onClick={() => navigate(`/playground/challenges/${ch._id || ch.id}`)}
                >
                  💻 Solve Now
                </Button>
              </CardFooter>
            </Card>
          ))}
        </SimpleGrid>
      )}

      {totalPages > 1 && (
        <HStack justifyContent="center" mt={10} spacing={4}>
          <Button isDisabled={currentPage === 1} onClick={() => setCurrentPage(c => c - 1)} size="sm">Prev</Button>
          <Badge fontSize="sm" px={3} py={1} borderRadius="md">Page {currentPage} of {totalPages}</Badge>
          <Button isDisabled={currentPage === totalPages} onClick={() => setCurrentPage(c => c + 1)} size="sm">Next</Button>
        </HStack>
      )}
    </Container>
  );
}

function ChallengeDetail({ challenge, onBack }) {
  if (!challenge) return null;

  return (
    <Container maxW="container.md" py={10}>
      <Button variant="link" mb={6} onClick={onBack} colorScheme="blue">&larr; Back to Challenges</Button>
      
      <Box p={8} shadow="2xl" borderWidth="1px" borderRadius="2xl" bg={useColorModeValue("white", "gray.800")}>
        <HStack justifyContent="space-between" mb={4}>
          <Heading size="xl">{challenge.title}</Heading>
          {challenge.difficulty && (
            <Badge fontSize="md" px={3} py={1} borderRadius="md" colorScheme={challenge.difficulty === "Easy" ? "green" : challenge.difficulty === "Medium" ? "orange" : "red"}>
              {challenge.difficulty}
            </Badge>
          )}
        </HStack>

        {challenge.tags && (
          <HStack spacing={2} mb={6} flexWrap="wrap">
            {challenge.tags.map((tag) => (
              <Tag key={tag} size="md" colorScheme="blue" borderRadius="full">{tag}</Tag>
            ))}
          </HStack>
        )}

        <Divider mb={6} />
        
        <Box mb={8}>
          <Heading size="md" mb={4}>Description</Heading>
          <Text whiteSpace="pre-wrap" color={useColorModeValue("gray.700", "gray.300")} lineHeight="1.8">
            {challenge.description}
          </Text>
        </Box>

        {challenge.examples && challenge.examples.length > 0 && (
          <Box mb={8}>
            <Heading size="md" mb={4}>Examples</Heading>
            <VStack spacing={4} align="stretch">
              {challenge.examples.map((ex, i) => (
                <Box key={i} p={5} bg={useColorModeValue("gray.50", "gray.700")} borderRadius="xl" borderWidth="1px">
                  <Text><Text as="span" fontWeight="bold" color="gray.500">Input:</Text> <Text as="span" fontFamily="mono">{ex.input}</Text></Text>
                  <Text mt={2}><Text as="span" fontWeight="bold" color="gray.500">Output:</Text> <Text as="span" color="green.500" fontFamily="mono">{ex.output}</Text></Text>
                  {ex.explanation && <Text mt={3} fontStyle="italic" color="gray.500" fontSize="sm">Explanation: {ex.explanation}</Text>}
                </Box>
              ))}
            </VStack>
          </Box>
        )}
      </Box>
    </Container>
  );
}

export default function PlaygroundChallengesPage() {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    playgroundChallengesService.getChallenges()
      .then(setChallenges)
      .catch((err) => setError("Erreur lors du chargement des challenges (API locale non accessible ?)."))
      .finally(() => setLoading(false));
  }, []);

  const handleRandom = async () => {
    try {
      setLoading(true);
      const ch = await playgroundChallengesService.getRandomChallenge();
      if (ch) {
        navigate(`/playground/challenges/${ch._id || ch.id}`);
      }
    } catch (err) {
      setError("Erreur lors du chargement du challenge aléatoire.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ChallengeList 
      loading={loading} 
      error={error} 
      challenges={challenges} 
      onRandom={handleRandom}
      navigate={navigate}
    />
  );
}

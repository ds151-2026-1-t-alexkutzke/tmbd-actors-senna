import { useLocalSearchParams, Link } from "expo-router";
import { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  FlatList,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { api } from "../../src/api/tmdb";

interface Actor {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
}

interface MovieDetails {
  title: string;
  overview: string;
  poster_path: string | null;
  vote_average: number;
  runtime: number;
}

export default function MovieDetailsScreen() {
  // Captura o parâmetro '[id]' do nome do arquivo
  const { id } = useLocalSearchParams();

  // Detalhes do filme
  const [movie, setMovie] = useState<MovieDetails | null>(null);

  // Lista de atores
  const [actors, setActors] = useState<Actor[]>([]);

  // Estado para controlar o carregamento dos detalhes
  const [isLoading, setIsLoading] = useState(true);
  const [isActorsLoading, setIsActorsLoading] = useState(true);

  useEffect(() => {
    const fetchMovieDetails = async () => {
      try {
        const response = await api.get(`/movie/${id}`);
        setMovie(response.data);
      } catch (error) {
        console.error("Erro ao buscar detalhes:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMovieDetails();
  }, [id]); // O hook é re-executado caso o ID mude

  useEffect(() => {
    const fetchActorsList = async () => {
      try {
        const response = await api.get(`/movie/${id}/credits`);
        setActors(response.data.cast || []);
      } catch (error) {
        console.error("Erro ao buscar elenco:", error);
      } finally {
        setIsActorsLoading(false);
      }
    };

    fetchActorsList();
  }, [id]); // O hook é re-executado caso o ID mude

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#E50914" />
      </View>
    );
  }

  if (!movie) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Filme não encontrado.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {movie.poster_path && (
        <Image
          source={{
            uri: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
          }}
          style={styles.poster}
          resizeMode="cover"
        />
      )}
      <View style={styles.content}>
        <Text style={styles.title}>{movie.title}</Text>

        <View style={styles.statsContainer}>
          <Text style={styles.statText}>
            ⭐ {movie.vote_average.toFixed(1)}/10
          </Text>
          <Text style={styles.statText}>⏱️ {movie.runtime} min</Text>
        </View>

        <Text style={styles.sectionTitle}>Sinopse</Text>
        <Text style={styles.overview}>
          {movie.overview || "Sinopse não disponível para este filme."}
        </Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Elenco </Text>
        {isActorsLoading ? (
          <ActivityIndicator size="small" color="#E50914" />
        ) : actors.length > 0 ? (
          <FlatList
            data={actors.slice(0, 10)}
            keyExtractor={(actor) => actor.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.actorList}
            renderItem={({ item: actor }) => (
              <Link href={`/actor/${actor.id}`} asChild>
                <Pressable style={styles.actorCard}>
                  {actor.profile_path ? (
                    <Image
                      source={{
                        uri: `https://image.tmdb.org/t/p/w185${actor.profile_path}`,
                      }}
                      style={styles.actorPhoto}
                    />
                  ) : (
                    <View style={styles.actorPhotoPlaceholder} />
                  )}
                  <Text style={styles.actorName} numberOfLines={2}>
                    {actor.name}
                  </Text>
                  <Text style={styles.actorCharacter} numberOfLines={2}>
                    {actor.character}
                  </Text>
                </Pressable>
              </Link>
            )}
          />
        ) : (
          <Text style={styles.overview}>Elenco não disponível.</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#121212" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  poster: { width: "100%", height: 400 },
  content: { padding: 20 },
  title: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  statsContainer: { flexDirection: "row", gap: 16, marginBottom: 24 },
  statText: { color: "#ff7077", fontSize: 16, fontWeight: "600" },
  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  overview: { color: "#D1D5DB", fontSize: 16, lineHeight: 24 },
  errorText: { color: "#FFFFFF", fontSize: 18 },
  actorList: { paddingVertical: 8, gap: 12 },
  actorCard: { width: 100, alignItems: "center" },
  actorPhoto: { width: 80, height: 80, borderRadius: 40, marginBottom: 6 },
  actorPhotoPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#1F1F1F",
    marginBottom: 6,
  },
  actorName: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
  },
  actorCharacter: {
    color: "#9CA3AF",
    fontSize: 11,
    textAlign: "center",
    marginTop: 2,
  },
});

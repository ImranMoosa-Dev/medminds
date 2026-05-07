// ============================================================
// QUIZ MANAGEMENT FUNCTIONS (CLEAN VERSION)
// ============================================================

async function loadAllQuizzes() {
  try {
    const { data: quizzes, error } = await supabaseClient
      .from('quizzes')
      .select('*')
      .order('quiz_order', { ascending: true });

    if (error) throw error;

    const quizzesList = document.getElementById('quizzesList');
    
    if (!quizzes || quizzes.length === 0) {
      quizzesList.innerHTML = '<div style="text-align: center; color: #999; padding: 30px;">No quizzes created yet. Create one above!</div>';
      return;
    }

    let html = '';
    for (const quiz of quizzes) {
      const { count: questionCount } = await supabaseClient
        .from('questions')
        .select('id', { count: 'exact' })
        .eq('quiz_id', quiz.id);

      const isPublished = quiz.is_published;
      const publishedBadge = isPublished 
        ? '<span style="color: #2e7d32; font-weight: 600;">Published</span>'
        : '<span style="color: #f57c00; font-weight: 600;">Draft</span>';

      html += '<div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin-bottom: 12px; border-left: 4px solid #0b63b7;">';
      html += '<div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 10px;">';
      html += '<div>';
      html += '<h4 style="margin: 0; color: #333; font-size: 14px;">' + quiz.quiz_order + '. ' + quiz.name + '</h4>';
      html += '<p style="margin: 5px 0 0 0; color: #666; font-size: 12px;">' + (quiz.description || 'No description') + '</p>';
      html += '<div style="margin-top: 8px; font-size: 12px; color: #999;">' + (questionCount || 0) + ' questions</div>';
      html += '</div>';
      html += '<div style="text-align: right;">' + publishedBadge + '</div>';
      html += '</div>';
      
      html += '<div style="display: flex; gap: 8px; flex-wrap: wrap;">';
      html += '<button onclick="openEditQuizModal(' + quiz.id + ')" style="padding: 6px 12px; background: #1976d2; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px; font-weight: 600;">Edit</button>';
      
      if (!isPublished) {
        html += '<button onclick="publishQuiz(' + quiz.id + ', \'' + quiz.name.replace(/'/g, "\\'") + '\')" style="padding: 6px 12px; background: #2e7d32; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px; font-weight: 600;">Publish</button>';
      } else {
        html += '<button onclick="unpublishQuiz(' + quiz.id + ')" style="padding: 6px 12px; background: #f57c00; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px; font-weight: 600;">Unpublish</button>';
      }
      
      html += '<button onclick="deleteQuiz(' + quiz.id + ', \'' + quiz.name.replace(/'/g, "\\'") + '\')" style="padding: 6px 12px; background: #c62828; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px; font-weight: 600;">Delete</button>';
      html += '</div></div>';
    }

    quizzesList.innerHTML = html;

  } catch (error) {
    console.error('Error loading quizzes:', error);
    document.getElementById('quizzesList').innerHTML = '<div style="color: #c62828;">Error loading quizzes: ' + (error?.message || 'Unknown') + '</div>';
  }
}

async function publishQuiz(quizId, quizName) {
  if (!confirm('Publish "' + quizName + '"? All users will be notified.')) {
    return;
  }

  try {
    const { error: updateError } = await supabaseClient
      .from('quizzes')
      .update({ is_published: true })
      .eq('id', quizId);

    if (updateError) throw updateError;

    const { data: allUsers } = await supabaseClient
      .from('users')
      .select('email, first_name')
      .eq('role', 'student');

    if (allUsers && allUsers.length > 0) {
      for (const user of allUsers) {
        await sendEmailNotification(
          user.email,
          'New Quiz Available: ' + quizName,
          'new_quiz_uploaded',
          {
            name: user.first_name || 'Student',
            quizName: quizName,
            questionCount: 'Check the platform!'
          }
        );
      }
    }

    alert('Quiz published! ' + (allUsers?.length || 0) + ' users notified.');
    await loadAllQuizzes();

  } catch (error) {
    console.error('Error publishing quiz:', error);
    alert('Error publishing quiz: ' + (error?.message || 'Unknown'));
  }
}

async function unpublishQuiz(quizId) {
  if (!confirm('Unpublish this quiz? It will be hidden from students.')) {
    return;
  }

  try {
    const { error } = await supabaseClient
      .from('quizzes')
      .update({ is_published: false })
      .eq('id', quizId);

    if (error) throw error;

    alert('Quiz unpublished');
    await loadAllQuizzes();

  } catch (error) {
    console.error('Error unpublishing quiz:', error);
    alert('Error: ' + (error?.message || 'Unknown'));
  }
}

async function deleteQuiz(quizId, quizName) {
  if (!confirm('Delete "' + quizName + '" and all its questions? This cannot be undone.')) {
    return;
  }

  if (!confirm('This will also delete all student attempts for this quiz. Continue?')) {
    return;
  }

  try {
    const { error } = await supabaseClient
      .from('quizzes')
      .delete()
      .eq('id', quizId);

    if (error) throw error;

    alert('Quiz deleted');
    await loadAllQuizzes();

  } catch (error) {
    console.error('Error deleting quiz:', error);
    alert('Error: ' + (error?.message || 'Unknown'));
  }
}

async function loadQuestionsForQuiz() {
  const quizId = document.getElementById('quizForQuestions').value;

  if (!quizId) {
    document.getElementById('questionsListForQuiz').innerHTML = '<div style="text-align: center; color: #999; padding: 20px;">Select a quiz to view its questions</div>';
    return;
  }

  try {
    const { data: questions, error } = await supabaseClient
      .from('questions')
      .select('*')
      .eq('quiz_id', quizId)
      .order('id', { ascending: true });

    if (error) throw error;

    if (!questions || questions.length === 0) {
      document.getElementById('questionsListForQuiz').innerHTML = '<div style="text-align: center; color: #999; padding: 20px;">No questions in this quiz yet. Use the Questions tab to add them.</div>';
      return;
    }

    let html = '';
    questions.forEach((question, idx) => {
      html += '<div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin-bottom: 12px; border-left: 4px solid #0b63b7;">';
      html += '<h4 style="margin: 0 0 10px 0; color: #333; font-size: 13px;">' + (idx + 1) + '. ' + question.question_text + '</h4>';
      html += '<div style="font-size: 12px; color: #666;">';
      if (question.options) {
        question.options.split('|').forEach((opt, i) => {
          html += '<div style="margin: 3px 0;">' + String.fromCharCode(65 + i) + ') ' + opt;
          if (i == question.correct_option) {
            html += ' (Correct)';
          }
          html += '</div>';
        });
      }
      html += '</div></div>';
    });

    document.getElementById('questionsListForQuiz').innerHTML = html;

  } catch (error) {
    console.error('Error loading questions:', error);
    document.getElementById('questionsListForQuiz').innerHTML = '<div style="color: #c62828;">Error: ' + (error?.message || 'Unknown') + '</div>';
  }
}

// Leaderboard function fix
async function loadLeaderboard() {
  try {
    const batchFilter = document.getElementById('leaderboardBatchFilter')?.value;
    
    const { data: attemptsData } = await supabaseClient
      .from('quiz_attempts')
      .select('user_id, score, total, created_at')
      .order('score', { ascending: false });

    const { data: usersData } = await supabaseClient.from('users').select('*');
    
    if (!usersData || usersData.length === 0) {
      document.getElementById('leaderboardContent').innerHTML = '<p class="no-data">No users found</p>';
      return;
    }

    const batchSelect = document.getElementById('leaderboardBatchFilter');
    const uniqueBatches = [...new Set(usersData.map(u => u.batch_id))];
    uniqueBatches.forEach(batchId => {
      if (!batchSelect.querySelector('option[value="' + batchId + '"]')) {
        const option = document.createElement('option');
        option.value = batchId;
        option.textContent = batchId;
        batchSelect.appendChild(option);
      }
    });

    const userScores = {};
    attemptsData?.forEach(attempt => {
      const user = usersData.find(u => u.id === attempt.user_id);
      if (user) {
        const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email || 'Unknown';
        const percentage = Math.round((attempt.score / attempt.total) * 100);
        if (!userScores[user.id]) {
          userScores[user.id] = { name: fullName, email: user.email, batch_id: user.batch_id, scores: [] };
        }
        userScores[user.id].scores.push(percentage);
      }
    });

    const rankings = Object.values(userScores).map(u => ({
      ...u,
      average: u.scores.length > 0 ? Math.round(u.scores.reduce((a, b) => a + b) / u.scores.length) : 0,
      attempts: u.scores.length
    })).sort((a, b) => b.average - a.average);

    const filtered = batchFilter ? rankings.filter(u => u.batch_id === batchFilter) : rankings;

    const content = document.getElementById('leaderboardContent');
    let html = '<table class="attempts-data-table" style="width: 100%;"><thead><tr><th>Rank</th><th>Name</th><th>Batch</th><th>Average Score</th><th>Attempts</th><th>Email</th></tr></thead><tbody>';

    filtered.forEach((user, idx) => {
      const medals = ['1st', '2nd', '3rd'];
      const medal = idx < 3 ? medals[idx] : '';
      html += '<tr><td style="font-weight: 600; font-size: 16px;">' + medal + ' #' + (idx + 1) + '</td>';
      html += '<td><strong>' + user.name + '</strong></td>';
      html += '<td>' + (user.batch_id || 'N/A') + '</td>';
      html += '<td style="color: ' + (user.average >= 70 ? '#16a34a' : '#ef4444') + '; font-weight: 600;">' + user.average + '%</td>';
      html += '<td>' + user.attempts + '</td>';
      html += '<td>' + user.email + '</td></tr>';
    });

    html += '</tbody></table>';
    content.innerHTML = html;
  } catch (e) {
    console.error('Error loading leaderboard:', e);
    document.getElementById('leaderboardContent').innerHTML = '<p class="no-data">Error loading leaderboard</p>';
  }
}